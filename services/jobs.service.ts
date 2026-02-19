import { prisma } from "@/lib/db";
import { ServiceError } from "@/utils/helpers";


export interface PaginatedJobResult {
    data: any[];
    meta: {
        page: number,
        limit: number,
        total: number,
        totalPages: number
    };
}

// Get all jobs
export async function getAllJobs(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedJobResult> {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.job.count({
            where: { userId }
        })
    ]);
    return {
        data: jobs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// Get a job by ID
export async function getJobById(id: string, userId: string) {
    const job = await prisma.job.findFirst({
        where: { id, userId }
    })
    if (!job) {
        throw new ServiceError("Job not found", 404);
    }
    return job;
}

// Create a job
export async function createJob(userId: string, title: string, company: string, location: string, status: string, description: string, notes: string) {
    if (!title || !company || !location || !status || !description) {
        throw new ServiceError("Missing required fields", 400);
    }

    return prisma.job.create({
        data: {
            title,
            company,
            location,
            status,
            description,
            notes,
            userId
        },
    });
}

// Update a job
export async function updateJob(
    id: string,
    userId: string,
    data: {
        title?: string;
        company?: string;
        location?: string;
        status?: string;
        description?: string;
        notes?: string;
    }
) {
    const existingJob = await prisma.job.findFirst({
        where: { id, userId }
    });

    if (!existingJob) {
        throw new ServiceError("Job not found", 404);
    }

    return prisma.job.update({
        where: { id },
        data
    });
}

// Delete a job
export async function deleteJob(id: string, userId: string) {
    const job = await prisma.job.findFirst({
        where: { id, userId },
        select: { id: true }
    });

    if (!job) {
        throw new ServiceError("Job not found", 404);
    }

    await prisma.job.delete({
        where: { id }
    });

    return { deleted: true };
}