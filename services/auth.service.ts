import { prisma } from "@/lib/db";
import { ServiceError } from "@/utils/helpers";
import { generateToken } from "@/utils/jwt";
import bcrypt from "bcrypt";

const normalizedEmail = (email: string) => email.toLowerCase().trim();
const normalizedName = (name: string) => name.trim();

// Login
export async function login(email: string, password: string) {
    if (!email || !password) {
        throw new ServiceError("Missing required fields", 400);
    }

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail(email) }
    });

    if (!user) {
        throw new ServiceError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ServiceError("Invalid credentials", 401);
    }

    const token = generateToken({ id: user.id });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    }
}

// Register
export async function register(email: string, password: string, name: string) {
    if (!email || !password || !name) {
        throw new ServiceError("Missing required fields", 400);
    }

    if (password.length < 8) {
        throw new ServiceError("Password must be at least 8 characters long", 400);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail(email) }
    });
    if (existingUser) {
        throw new ServiceError("Account already exists", 409);
    };
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email: normalizedEmail(email),
            password: hashedPassword,
            name: normalizedName(name)
        }
    });

    const token = generateToken({ id: newUser.id });

    return {
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        },
        token
    }
}