import { getAuthUser } from "@/lib/auth";
import { createOrUpdateEvaluation, getEvaluations } from "@/services/evaluations.service";
import { ServiceError } from "@/utils/helpers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { resumeId, jobId } = body;

        const evaluation = await createOrUpdateEvaluation(user.id, resumeId, jobId);
        return NextResponse.json(evaluation, { status: 200 })
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
        const search = searchParams.get("search") || undefined;
        const sortKey = searchParams.get("sortKey") || "createdAt";
        const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

        const evaluations = await getEvaluations(user.id, page, limit, search, sortKey, sortOrder);
        return NextResponse.json(evaluations);
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
