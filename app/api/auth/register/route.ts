import { NextResponse } from "next/server";
import { register } from "@/services/auth.service";
import { ServiceError } from "@/utils/helpers";

export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
        const user = await register(email, password, name, ip);
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof ServiceError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}