import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getResumeById } from "@/services/resume.service";
import path from "path";
import fs from "fs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser(request);
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const { id } = await params;
        const resume = await getResumeById(id, user.id);
        const filePath = path.resolve(process.cwd(), 'uploads', resume.fileName);
        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }
        const ext = path.extname(resume.fileName).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".pdf") {
            contentType = "application/pdf";
        } else if (ext === ".docx") {
            contentType =
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (ext === ".doc") {
            contentType = "application/msword";
        }
        const fileStream = fs.createReadStream(filePath);
        return new NextResponse(fileStream as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${resume.fileName}"`,
            },
            status: 200,
        });
    } catch (error: any) {
        return new NextResponse(error.message || "Internal server error", { status: 500 });
    }
}