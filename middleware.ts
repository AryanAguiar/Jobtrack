import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = ["/dashboard", "/jobs", "/resumes", "/evaluations"];

function isProtectedPage(pathname: string): boolean {
    return PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );
}

export default async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const pathname = request.nextUrl.pathname;
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isProtected = isProtectedPage(pathname);

    if (!token) {
        if (isProtected) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        const response = NextResponse.next();
        if (isProtected) {
            response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
        }
        return response;
    } catch (error) {
        const response = isProtected
            ? NextResponse.redirect(new URL("/login", request.url))
            : NextResponse.next();
        response.cookies.delete("token");
        if (isProtected) {
            response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
        }
        return response;
    }
}

export const config = {
    matcher: ["/login", "/signup", "/dashboard/:path*", "/jobs/:path*", "/resumes/:path*", "/evaluations/:path*"],
}