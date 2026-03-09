import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export default async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const pathname = request.nextUrl.pathname;
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isDashboardPage = pathname.startsWith("/dashboard");

    if (!token) {
        if (isDashboardPage) {
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
        return NextResponse.next();
    } catch (error) {
        const response = isDashboardPage
            ? NextResponse.redirect(new URL("/login", request.url))
            : NextResponse.next();
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: ["/login", "/signup", "/dashboard/:path*"],
}