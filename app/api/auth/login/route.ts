import { NextResponse } from "next/server";
import { ServiceError } from "@/utils/helpers";
import { login, logout } from "@/services/auth.service";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
        const { user, token } = await login(email, password, ip);
        const response = NextResponse.json({ user, token }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
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

export async function DELETE(request: Request) {
    try {
        await logout();
        return NextResponse.json({ message: "Logout successful" }, { status: 200 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
