import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { parsePdf } from "@/lib/parser";
import { hashText, normalizeText, ServiceError } from "@/utils/helpers";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface PaginatedResumesResult {
    data: any[];
    meta: {
        page: number,
        limit: number,
        total: number,
        totalPages: number
    };
}

// Get all resumes for a given user, including parsed data.
export async function getUserResumes(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResumesResult> {
    const skip = (page - 1) * limit;
    const [resumes, total] = await Promise.all([
        prisma.resume.findMany({
            where: { userId },
            include: { parsedData: true },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.resume.count({
            where: { userId }
        })
    ]);
    return {
        data: resumes,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// Get a single resume by id
export async function getResumeById(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: { parsedData: true },
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    return resume;
}

// Upload a resume
export async function uploadResume(file: File, title: string, userId: string) {
    if (!file || !title) {
        throw new ServiceError("Missing file or title", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ServiceError("File size exceeds 10MB limit", 400);
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const parsed = await parsePdf(filePath);
    const cleanedText = normalizeText(parsed.text);
    const resumeHash = hashText(cleanedText);
    const resume = await prisma.resume.create({
        data: {
            title,
            fileName: safeName,
            fileUrl: `/uploads/${safeName}`,
            userId,
            mimeType: file.type,
            contentHash: resumeHash,
            parsedData: {
                create: {
                    rawText: parsed.text,
                    skills: parsed.skills,
                    experience: parsed.experience,
                    education: parsed.education,
                },
            },
        },
        include: { parsedData: true },
    });

    return resume;
}

// Delete a resume by id, scoped to a user. Also removes the file from disk if it exists.
export async function deleteResume(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    const filePath = path.join(UPLOADS_DIR, resume.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await prisma.resume.delete({
        where: { id: resumeId },
    });

    return { deleted: true };
}


