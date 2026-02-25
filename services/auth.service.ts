import { prisma } from "@/lib/db";
import { loginLimiter, registerLimiter } from "@/lib/rateLimiter";
import { ServiceError } from "@/utils/helpers";
import { generateToken } from "@/utils/jwt";
import bcrypt from "bcrypt";

const normalizeEmail = (email: string) => email.toLowerCase().trim();
const normalizeName = (name: string) => name.trim();
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Login
export async function login(email: string, password: string, ip: string) {
    if (!email || !password) {
        throw new ServiceError("Missing required fields", 400);
    }

    const emailKey = `${normalizeEmail(email)}`;
    const ipKey = `${ip}`;

    const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
    });

    if (!user) {
        try {
            await loginLimiter.consume(emailKey);
            await loginLimiter.consume(ipKey);
        } catch (err) {
            throw new ServiceError("Too many failed login attempts. Please try again shortly.", 429);
        }
        throw new ServiceError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        try {
            await loginLimiter.consume(emailKey);
            await loginLimiter.consume(ipKey);
        } catch (err) {
            throw new ServiceError("Too many failed login attempts. Please try again shortly.", 429);
        }
        throw new ServiceError("Invalid credentials", 401);
    }

    await loginLimiter.delete(emailKey);
    await loginLimiter.delete(ipKey);

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
export async function register(email: string, password: string, name: string, ip: string) {
    if (!email || !password || !name) {
        throw new ServiceError("Missing required fields", 400);
    }

    if (!isValidEmail(email)) {
        throw new ServiceError("Invalid email format", 400);
    }

    if (password.length < 8) {
        throw new ServiceError("Password must be at least 8 characters long", 400);
    }

    try {
        await registerLimiter.consume(ip);
    } catch (err) {
        throw new ServiceError("Too many registration attempts. Please try again shortly.", 429);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
    });
    if (existingUser) {
        throw new ServiceError("Account already exists", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email: normalizeEmail(email),
            password: hashedPassword,
            name: normalizeName(name)
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