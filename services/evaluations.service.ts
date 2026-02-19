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
export async function getEvaluations(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedEvaluationResult> {
    const skip = (page - 1) * limit;
    const [evaluations, total] = await Promise.all([
        prisma.resumeEvaluations.findMany({
            where: {
                resume: { userId }
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
                resume: { userId }
            }
        })
    ]);
    return {
        data: evaluations,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
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

    return savedEvaluation;
}
