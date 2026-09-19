import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DATA_TYPES, VALIDATION_TYPES } from "@/lib/constants";

const fieldMappingSchema = z.object({
    excelColumn: z.string().min(1),
    targetField: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, "Gunakan huruf kecil & underscore, contoh: first_name"),
    dataType: z.enum(DATA_TYPES),
    isRequired: z.boolean(),
    validationType: z.enum(VALIDATION_TYPES) 
})

const configSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    description: z.string().optional(),
    targetData: z.string().min(1, "Target data wajib diisi"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    fieldMappings: z.array(fieldMappingSchema).min(1, "Minimal 1 field mapping"),
})

// GET semua config
export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
    }

    const configs = await prisma.importConfiguration.findMany({
        include: {
            fieldMappings: { orderBy: { columnOrder: "asc" } },
            createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(configs)
}

// POST hanya Admin yang bisa bikin config
export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 })
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

    const config = await prisma.importConfiguration.create({
        data: {
            ...configData,
            createdById: session.userId,
            fieldMappings: {
                create: fieldMappings.map((fm, index) => ({ ...fm, columnOrder: index }))
            },
        },
        include: { fieldMappings: true },
    })

    return NextResponse.json(config, { status: 201 })
}
