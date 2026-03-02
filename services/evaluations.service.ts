import { prisma } from "@/lib/db";
import { evaluateResume } from "@/lib/evaluator";
import { ServiceError } from "@/utils/helpers";

export interface PaginatedEvaluationResult {
    data: any[];
    meta: {
        page: number,
        limit: number,
        total: number,
        totalPages: number
    };
}

// Get all evaluations
export async function getEvaluations(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortKey: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
): Promise<PaginatedEvaluationResult> {
    const skip = (page - 1) * limit;

    const where: any = {
        resume: { userId }
    };

    if (search) {
        where.OR = [
            { job: { title: { contains: search, mode: "insensitive" } } },
            { resume: { title: { contains: search, mode: "insensitive" } } }
        ];
    }

    const orderBy: any = {};
    if (sortKey === "matchScore") {
        orderBy.matchScore = sortOrder;
    } else {
        orderBy.createdAt = sortOrder;
    }

    const [evaluations, total] = await Promise.all([
        prisma.resumeEvaluations.findMany({
            where,
            include: {
                resume: {
                    include: {
                        parsedData: true
                    }
                },
                job: true,
            },
            skip,
            take: limit,
            orderBy
        }),
        prisma.resumeEvaluations.count({
            where
        })
    ]);

    const formattedData = evaluations.map(evaluation => ({
        id: evaluation.id,
        userId: evaluation.resume.userId,
        resumeId: evaluation.resumeId,
        resumeTitle: evaluation.resume.title,
        jobTitle: evaluation.job.title,
        matchScore: evaluation.matchScore,
        summary: evaluation.summary,
        breakdown: evaluation.breakdown,
        parsedData: evaluation.resume.parsedData,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        modelUsed: evaluation.modelUsed,
        promptHash: evaluation.promptHash,
        createdAt: evaluation.createdAt,
    }));

    return {
        data: formattedData,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

// Get evaluation by id
export async function getEvaluationById(id: string, userId: string) {
    const evaluation = await prisma.resumeEvaluations.findFirst({
        where: { id: id, resume: { userId } },
        include: {
            resume: {
                include: {
                    parsedData: true
                }
            },
            job: true,
        }
    });

    if (!evaluation) {
        throw new ServiceError("Evaluation not found", 404);
    }

    return {
        id: evaluation.id,
        userId: evaluation.resume.userId,
        resumeId: evaluation.resumeId,
        resumeTitle: evaluation.resume.title,
        jobTitle: evaluation.job.title,
        matchScore: evaluation.matchScore,
        summary: evaluation.summary,
        breakdown: evaluation.breakdown,
        parsedData: evaluation.resume.parsedData,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        modelUsed: evaluation.modelUsed,
        promptHash: evaluation.promptHash,
        createdAt: evaluation.createdAt,
    };
}

// Create evaluation
export async function createOrUpdateEvaluation(userId: string, resumeId: string, jobId: string) {
    if (!userId || !resumeId || !jobId) {
        throw new ServiceError("Missing required fields", 400);
    }

    // Verify resume belongs to user
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId
        },
        include: { parsedData: true }
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    if (!resume.parsedData) {
        throw new ServiceError("Resume has no parsed data. Please parse resume first.", 400);
    }

    const job = await prisma.job.findFirst({
        where: { id: jobId },
    });

    if (!job) {
        throw new ServiceError("Job not found", 404);
    }

    const formattedResume = `
       EXPERIENCE:
       ${typeof resume.parsedData.experience === 'object'
            ? JSON.stringify(resume.parsedData.experience, null, 2)
            : resume.parsedData.experience || "Not provided"}
 
       EDUCATION:
       ${typeof resume.parsedData.education === 'object'
            ? JSON.stringify(resume.parsedData.education, null, 2)
            : resume.parsedData.education || "Not provided"}
 
       SKILLS:
       ${Array.isArray(resume.parsedData.skills) ? resume.parsedData.skills.join(", ") : resume.parsedData.skills || "Not provided"}
       `;


    const evaluation = await evaluateResume(formattedResume, job.description, userId);

    const savedEvaluation = await prisma.resumeEvaluations.upsert({
        where: {
            resumeId_jobId: {
                resumeId: resume.id,
                jobId: job.id,
            },
        },
        update: {
            matchScore: evaluation.matchScore,
            breakdown: evaluation.breakdown,
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
            breakdown: evaluation.breakdown,
            summary: evaluation.summary,
            strengths: evaluation.strengths,
            gaps: evaluation.gaps,
            modelUsed: evaluation.modelUsed,
            promptHash: evaluation.promptHash,
        },
    });

    return savedEvaluation;
}
