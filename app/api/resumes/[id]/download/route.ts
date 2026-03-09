import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { downloadResume } from "@/services/resume.service";
import { ServiceError } from "@/utils/helpers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser(request);
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const { id } = await params;
        const { stream, contentType, fileName } = await downloadResume(id, user.id);
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
            status: 200,
        });
    } catch (error: any) {
        if (error instanceof ServiceError) {
            return new NextResponse(error.message, { status: error.status });
        }
        return new NextResponse(error.message || "Internal server error", { status: 500 });
    }
}