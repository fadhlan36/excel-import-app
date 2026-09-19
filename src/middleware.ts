import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/auth";

const PROTECTED_PATH = ["/dashboard", "/import", "/admin"]
const ADMIN_ONLY_PATH = ["/admin"]

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const isProtected = PROTECTED_PATH.some((p) => pathname.startsWith(p))
    if (!isProtected) return NextResponse.next()
    
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? await verifyToken(token) : null
    
    if (!session) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    const isAdminOnly = ADMIN_ONLY_PATH.some((p) => pathname.startsWith(p))
    if (isAdminOnly && session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/import/:path*", "/admin/:path*"],
}