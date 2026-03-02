import { NextResponse } from "next/server";
import { register } from "@/services/auth.service";
import { ServiceError } from "@/utils/helpers";

export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
        const { user, token } = await register(email, password, name, ip);
        const response = NextResponse.json({ user, token }, { status: 201 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return response;
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}