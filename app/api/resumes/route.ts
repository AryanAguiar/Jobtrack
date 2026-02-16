import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { parsePdf } from "@/lib/parser";

// List all resumes
export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
        where: { userId: user.id },
        include: { parsedData: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ message: "Resumes fetched successfully", resumes }, { status: 201 });
}

// Upload resumes
export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get('title') as string | null;

    if (!file || !title) {
        return NextResponse.json({ message: "Missing or invalid file" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ message: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
    const safeName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const parsed = await parsePdf(filePath);

    const resume = await prisma.resume.create({
        data: {
            title,
            fileName: safeName,
            fileUrl: `/uploads/${safeName}`,
            userId: user.id,
            mimeType: file.type,
            parsedData: {
                create: {
                    rawText: parsed.text,
                    keywords: parsed.keywords,
                    skills: parsed.skills,
                    experience: parsed.experience,
                    education: parsed.education,
                },
            },
        },
        include: { parsedData: true },
    });

    return NextResponse.json({ message: "Resume uploaded successfully", resume }, { status: 200 });
}