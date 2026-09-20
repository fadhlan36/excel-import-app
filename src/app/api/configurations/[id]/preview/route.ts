import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseAndValidateExcel } from "@/lib/excel-processor";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // 1. Ubah tipe menjadi Promise
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 2. Await params terlebih dahulu untuk mengambil id-nya
    const { id } = await params;

    const config = await prisma.importConfiguration.findUnique({
        where: { id }, // 3. Gunakan id yang sudah di-await
        include: { fieldMappings: { orderBy: { columnOrder: "asc" } } },
    });
    if (!config || config.status !== "ACTIVE") {
        return NextResponse.json({ message: "Konfigurasi tidak ditemukan / tidak aktif" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ message: "File wajib diupload" }, { status: 400 });

    const result = await parseAndValidateExcel(file, config.id, config.fieldMappings);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });

    const validCount = result.rows.filter((r) => r.status === "VALID").length;

    return NextResponse.json({
        fileName: file.name,
        totalRows: result.rows.length,
        validCount,
        invalidCount: result.rows.length - validCount,
        rows: result.rows,
    });
}