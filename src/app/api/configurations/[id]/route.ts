import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DATA_TYPES, VALIDATION_TYPES } from "@/lib/constants";

const fieldMappingSchema = z.object({
    excelColumn: z.string().min(1),
    targetField: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/),
    dataType: z.enum(DATA_TYPES),
    isRequired: z.boolean(),
    validationType: z.enum(VALIDATION_TYPES),
})

const configSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    targetData: z.string().min(1),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    fieldMappings: z.array(fieldMappingSchema).min(1),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ message: "User tidak dikenali!" }, { status: 401 })
    }

    const config = await prisma.importConfiguration.findUnique({
        where: { id },
        include: { fieldMappings: { orderBy: { columnOrder: "asc" } } },
    })

    if (!config) {
        return NextResponse.json({ message: "Konfigurasi tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(config)
}

export async function PUT(req: NextRequest, { params }: Params) {
    const { id } = await params
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ message: "User tidak dikenali!" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
        return NextResponse.json({ message: "Dilarang - hanya Admin!" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = configSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { message: "Data tidak valid", errors: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { fieldMappings, ...configData } = parsed.data

    const updated = await prisma.$transaction(async (tx) => {
        await tx.fieldMapping.deleteMany({ where: { configurationId: id } })

        return tx.importConfiguration.update({
            where: { id },
            data: {
                ...configData,
                updatedById: session.userId,
                fieldMappings: {
                    create: fieldMappings.map((fm, index) => ({ ...fm, columnOrder: index })),
                },
            },
            include: { fieldMappings: true }
        })
    })

    return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ message: "User Tidak dikenali!" }, { status: 401 })
    }
    if (session.role !== "ADMIN") {
        return NextResponse.json({ message: "Dilarang - hanya Admin!" }, { status: 403 })
    }

    try {
        await prisma.importConfiguration.delete({ where: { id } })
        return NextResponse.json({ message: "Konfigurasi dihapus" })
    } catch {
        return NextResponse.json(
            { message: "Tidak bisa dihapus, konfigurasi ini sudah punya riwayat import. Nonaktifkan saja." },
            { status: 409 }
        )
    }
}