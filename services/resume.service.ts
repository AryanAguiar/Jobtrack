import { prisma } from "@/lib/db";
import { parsePdf } from "@/lib/parser";
import { hashText, normalizeText, ServiceError } from "@/utils/helpers";
import { resumeUploadLimiter } from "@/lib/rateLimiter";
import { supaBase } from "@/lib/supabase";
import mammoth from "mammoth";

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

// Helper to generate public URL for a resume
export function getResumeUrl(fileName: string) {
    const { data } = supaBase.storage.from("JobtrackResumes").getPublicUrl(fileName);
    return data.publicUrl;
}

// Get all resumes for a given user including parsed data
export async function getUserResumes(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortKey?: "createdAt" | "title",
    sortOrder?: "asc" | "desc"
): Promise<PaginatedResumesResult> {
    const skip = (page - 1) * limit;

    const where: any = {
        userId
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { fileName: { contains: search, mode: "insensitive" } },
        ];
    }

    const [resumes, total] = await Promise.all([
        prisma.resume.findMany({
            where,
            include: { parsedData: true },
            skip,
            take: limit,
            orderBy: sortKey && sortOrder ? { [sortKey]: sortOrder } : { createdAt: "desc" },
        }),
        prisma.resume.count({
            where
        })
    ]);

    const resumesWithUrls = resumes.map((r) => ({
        ...r,
        fileUrl: getResumeUrl(r.fileName),
    }));

    return {
        data: resumesWithUrls,
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

    return {
        ...resume,
        fileUrl: getResumeUrl(resume.fileName),
    };
}

// Upload a resume
export async function uploadResume(file: File, title: string, userId: string) {
    if (!file || !title) {
        throw new ServiceError("Missing file or title", 400);
    }

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new ServiceError("Unsupported file type", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ServiceError("File size exceeds 10MB limit", 400);
    }

    try {
        await resumeUploadLimiter.consume(userId);
    } catch (err) {
        throw new ServiceError("Too many resume uploads. Please try again after 24 hours.", 429);
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const safeName = `${userId}/${Date.now()}-${sanitizedName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supaBase.storage.from("JobtrackResumes").upload(safeName, buffer, {
        contentType: file.type,
    });

    if (error) {
        throw new ServiceError(`Upload failed: ${error.message}`, 500);
    }

    let parsed;
    try {
        parsed = await parsePdf(buffer, file.name);
    } catch (error) {
        await supaBase.storage.from("JobtrackResumes").remove([safeName]).catch(() => console.warn("Failed to cleanup invalid file"));
        throw new ServiceError("Failed to parse resume", 500);
    }

    if (!parsed.isResume) {
        await supaBase.storage.from("JobtrackResumes").remove([safeName]).catch(() => console.warn("Failed to cleanup invalid file"));
        throw new ServiceError("The uploaded file does not appear to be a valid resume.", 400);
    }

    const cleanedText = normalizeText(parsed.text);
    const resumeHash = hashText(cleanedText);

    const existing = await prisma.resume.findFirst({
        where: {
            userId,
            contentHash: resumeHash,
        },
    });

    if (existing) {
        await supaBase.storage.from("JobtrackResumes").remove([existing.fileName]).catch(() => console.warn("Failed to cleanup duplicate file"));
        throw new ServiceError("Resume already exists", 400);
    }

    const resume = await prisma.resume.create({
        data: {
            title,
            fileName: safeName,
            userId,
            mimeType: file.type,
            contentHash: resumeHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

    return {
        ...resume,
        fileUrl: getResumeUrl(resume.fileName),
    };
}

// Delete a resume by id, scoped to a user. Also removes the file from disk if it exists.
export async function deleteResume(resumeId: string, userId: string) {
    if (!resumeId) {
        throw new ServiceError("Resume ID is required", 400);
    }

    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    const { error } = await supaBase.storage.from("JobtrackResumes").remove([resume.fileName]);

    if (error) {
        console.warn("Storage delete failed:", error.message);
    }

    await prisma.resume.delete({
        where: { id: resumeId },
    });

    return { deleted: true };
}

// Download a resume by id, scoped to a user.
export async function downloadResume(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    const { data, error } = await supaBase.storage.from("JobtrackResumes").download(resume.fileName);

    if (error || !data) {
        throw new ServiceError("File not found", 404);
    }

    const ext = resume.fileName.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (ext === "doc") contentType = "application/msword";

    return {
        stream: data.stream(),
        contentType,
        fileName: resume.fileName,
    };
}

// View resume
export async function viewResume(resumeId: string, userId: string) {
    const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    const { data, error } = await supaBase.storage.from("JobtrackResumes").download(resume.fileName);

    if (error || !data) {
        throw new ServiceError("File not found", 404);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const ext = resume.fileName.split(".").pop()?.toLowerCase();

    if (ext === "pdf" || resume.mimeType === "application/pdf") {
        return {
            body: buffer,
            contentType: "application/pdf",
            disposition: `inline; filename="${resume.fileName}"`,
        };
    }

    if (ext === "docx" || ext === "doc") {
        const result = await mammoth.convertToHtml({ buffer });
        const html = `<!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8" />
                            <style>
                                body {
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    max-width: 800px;
                                    margin: 2rem auto;
                                    padding: 0 1.5rem;
                                    color: #1a1a1a;
                                    line-height: 1.6;
                                }
                                h1, h2, h3 { color: #111827; }
                                p { margin: 0.5rem 0; }
                                ul, ol { padding-left: 1.5rem; }
                                table { border-collapse: collapse; width: 100%; }
                                td, th { border: 1px solid #e5e7eb; padding: 0.5rem; }
                            </style>
                        </head>
                        <body>${result.value}</body>
                    </html>`;
        return {
            body: html,
            contentType: "text/html; charset=utf-8",
            disposition: "inline",
        };
    }

    return {
        body: buffer,
        contentType: resume.mimeType || "application/octet-stream",
        disposition: `inline; filename="${resume.fileName}"`,
    };
}
