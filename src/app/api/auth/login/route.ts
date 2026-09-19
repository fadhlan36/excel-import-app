import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { message: "Email dan password wajib diisi" },
            { status: 400 }
        )
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user || !(await verifyPassword(password, user.password))) {
        return NextResponse.json(
            { message: "Email atau password salah" },
            { status: 401 }
        )
    }

    await createSession(
        { userId: user.id, email: user.email, role: user.role }
    )

    return NextResponse.json(
        { message: "Login berhasil",
            user: { id: user.id, name: user.name, role: user.role }
         }
    )
}
