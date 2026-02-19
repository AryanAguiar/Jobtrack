import { getAuthUser } from "@/lib/auth";
import { deleteJob, getJobById, updateJob } from "@/services/jobs.service";
import { ServiceError } from "@/utils/helpers";
import { NextResponse } from "next/server";

type Params = {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const job = await getJobById(id, user.id);
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const job = await deleteJob(id, user.id);
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
        }

        const job = await updateJob(id, user.id, body);
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}