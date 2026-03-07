import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getResumeById } from "@/services/resume.service";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // PDFs can be rendered natively by the browser
        if (ext === ".pdf") {
            const fileStream = fs.createReadStream(filePath);
            return new NextResponse(fileStream as any, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="${resume.fileName}"`,
                },
                status: 200,
            });
        }

        // Word files: convert to HTML so the browser can render them in an iframe
        if (ext === ".docx" || ext === ".doc") {
            const buffer = fs.readFileSync(filePath);
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
            return new NextResponse(html, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                status: 200,
            });
        }

        // Fallback: serve raw file
        const fileStream = fs.createReadStream(filePath);
        return new NextResponse(fileStream as any, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `inline; filename="${resume.fileName}"`,
            },
            status: 200,
        });
    } catch (error: any) {
        return new NextResponse(error.message || "Internal server error", { status: 500 });
    }
}
