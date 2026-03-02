import { getAuthUser } from "@/lib/auth";
import { getEvaluationById } from "@/services/evaluations.service";
import { ServiceError } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const evaluation = await getEvaluationById(id, user.id);
        return NextResponse.json(evaluation);
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        console.error("Error fetching evaluation:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}