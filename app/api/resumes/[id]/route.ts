import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getResumeById, deleteResume } from "@/services/resume.service";
import { ServiceError } from "@/utils/helpers";

// GET a single resume by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const resume = await getResumeById(params.id, user.id);
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
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deleteResume(params.id, user.id);
        return NextResponse.json({ message: "Resume deleted successfully", ...result });
    } catch (error: any) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
