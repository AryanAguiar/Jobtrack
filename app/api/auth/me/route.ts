import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/services/auth.service";
import { ServiceError } from "@/utils/helpers";

export async function GET() {
    try {
        const user = await getServerAuthUser();
        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}