import { NextResponse } from "next/server";
import { ServiceError } from "@/utils/helpers";
import { login } from "@/services/auth.service";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
        const { user, token } = await login(email, password, ip);
        return NextResponse.json({ user, token }, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

}