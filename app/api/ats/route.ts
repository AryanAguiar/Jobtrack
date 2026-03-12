import { getAuthUser } from "@/lib/auth";
import { atsChecker } from "@/services/atsCheck.service";
import { ServiceError } from "@/utils/helpers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized session" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { resumeId } = body;

        if (!resumeId) {
            return NextResponse.json({ message: "resumeId is required" }, { status: 400 });
        }

        const evaluation = await atsChecker(user.id, resumeId);
        return NextResponse.json(evaluation, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
