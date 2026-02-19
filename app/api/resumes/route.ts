import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserResumes, uploadResume } from "@/services/resume.service";
import { ServiceError } from "@/utils/helpers";

// List all resumes
export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { searchParams } = new URL(request.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const resumes = await getUserResumes(user.id, page, limit);
        return NextResponse.json({ message: "Resumes fetched successfully", resumes }, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Failed to fetch resumes" }, { status: 500 });
    }
}

// Upload resume
export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string | null;

        const resume = await uploadResume(file!, title!, user.id);
        return NextResponse.json({ message: "Resume uploaded successfully", resume }, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}