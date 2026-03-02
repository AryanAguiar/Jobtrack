import { verifyToken } from "@/utils/jwt";
import { prisma } from "./db";
import { cookies } from "next/headers";

export async function getAuthUser(request: Request) {
    let token: string | undefined;

    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
    }

    if (!token) {
        return null;
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded?.id) return null;
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true }
        });
        return user;
    } catch (error) {
        return null;
    }
}