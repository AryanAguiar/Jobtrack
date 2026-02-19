import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createJob, getAllJobs } from "@/services/jobs.service";
import { ServiceError } from "@/utils/helpers";

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { title, company, location, status, description, notes } = body;
        const job = await createJob(user.id, title, company, location, status, description, notes);
        return NextResponse.json(job, { status: 201 });
    }
    catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { searchParams } = new URL(request.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const result = await getAllJobs(user.id, page, limit);
        return NextResponse.json({ message: "Jobs fetched successfully", result }, { status: 200 });
    }
    catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}