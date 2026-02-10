import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateToken } from "@/utils/jwt";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    if (!email || !password) {
        return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({ id: user.id });

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    }, { status: 200 });

}