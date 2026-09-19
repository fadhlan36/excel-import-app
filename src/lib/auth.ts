import bcrypt from "bcryptjs"
import { verify } from "crypto"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "sangat-rahasia-2026"
)

export const COOKIE_NAME = "session_token"

export type SessionPayLoad = {
    userId: string
    email: string
    role: "ADMIN" | "USER"
}

// dipakai pas bikin user
export async function hashPassword(password:string) {
    return bcrypt.hash(password, 10)
}

// bandingkan password yang kita input dengan hash di database
export async function verifyPassword(password:string, hash: string) {
    return bcrypt.compare(password, hash)
}

async function signToken(payload:SessionPayLoad) {
    return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET)
}

export async function verifyToken(token:string): Promise<SessionPayLoad | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as SessionPayLoad
    } catch {
        return null
    }
}

export async function createSession(payload:SessionPayLoad) {
    const token = await signToken(payload)
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8 // 8 jam
    })
}

// untuk cek siapa aja yang lagi login
export async function getSession(): Promise<SessionPayLoad | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

export async function destroySession() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}