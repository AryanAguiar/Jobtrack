import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { generateToken } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
        return NextResponse.json({ message: "Error creating user" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return NextResponse.json({ message: "Account already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    const token = generateToken({ id: user.id });

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }, token
    }, { status: 201 });
}