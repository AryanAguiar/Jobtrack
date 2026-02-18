import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evaluateResume } from "@/lib/evaluator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { resumeId, jobId } = body;

        if (!resumeId || !jobId) {
            return NextResponse.json({ message: "Missing resumeId or jobId" }, { status: 400 });
        }

        const resume = await prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId: user.id,
            },
            include: { parsedData: true },
        });

        const job = await prisma.job.findUnique({
            where: {
                id: jobId,
            }
        });

        if (!resume || !job) {
            return NextResponse.json({ message: "Resume or job not found" }, { status: 404 });
        }

        if (!resume.parsedData) {
            return NextResponse.json({ message: "Resume has no parsed data. Please parse resume first." }, { status: 400 });
        }

        const formattedResume = `
        EXPERIENCE:
        ${resume.parsedData.experience || "Not provided"}

        EDUCATION:
        ${resume.parsedData.education || "Not provided"}

        SKILLS:
        ${Array.isArray(resume.parsedData.skills) ? resume.parsedData.skills.join(", ") : resume.parsedData.skills || "Not provided"}
        `;

        const evaluation = await evaluateResume(formattedResume, job.description);
        const savedEvaluation = await prisma.resumeEvaluations.upsert({
            where: {
                resumeId_jobId: {
                    resumeId: resume.id,
                    jobId: job.id,
                },
            },
            update: {
                matchScore: evaluation.matchScore,
                summary: evaluation.summary,
                strengths: evaluation.strengths,
                gaps: evaluation.gaps,
                modelUsed: evaluation.modelUsed,
                promptHash: evaluation.promptHash,
            },
            create: {
                resumeId: resume.id,
                jobId: job.id,
                matchScore: evaluation.matchScore,
                summary: evaluation.summary,
                strengths: evaluation.strengths,
                gaps: evaluation.gaps,
                modelUsed: evaluation.modelUsed,
                promptHash: evaluation.promptHash,
            },
        });

        return NextResponse.json(savedEvaluation);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const skip = (page - 1) * limit;

    try {
        const [evaluations, totalEvaluations] = await Promise.all([
            prisma.resumeEvaluations.findMany({
                where: {
                    resume: {
                        userId: user.id,
                    },
                },
                include: {
                    resume: true,
                    job: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.resumeEvaluations.count({
                where: {
                    resume: {
                        userId: user.id,
                    },
                }
            })
        ])
        return NextResponse.json({
            data: evaluations,
            meta: {
                page,
                limit,
                totalEvaluations,
                totalPages: Math.ceil(totalEvaluations / limit),
            }
        })
    } catch (error) {
        return NextResponse.json({ message: "Unable to get evaluations" }, { status: 500 });
    }
}
