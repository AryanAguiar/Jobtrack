import { verifyToken } from "@/utils/jwt";
import { prisma } from "./db";

export async function getAuthUser(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
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