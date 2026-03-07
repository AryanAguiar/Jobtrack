import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getResumeById, deleteResume } from "@/services/resume.service";
import { ServiceError } from "@/utils/helpers";
import path from "path";
import fs from "fs";

// GET a single resume by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const resume = await getResumeById(id, user.id);
        return NextResponse.json(resume);
    } catch (error: any) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE a resume by ID
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const result = await deleteResume(id, user.id);
        return NextResponse.json({ message: "Resume deleted successfully", ...result });
    } catch (error: any) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
