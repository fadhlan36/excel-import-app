import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseAndValidateExcel } from "@/lib/excel-processor";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const config = await prisma.importConfiguration.findUnique({
        where: { id },
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

    if (result.rows.length === 0) {
        return NextResponse.json({ message: "Tidak ada baris data untuk diimport" }, { status: 400 });
    }

    const validRows = result.rows.filter((r) => r.status === "VALID");
    const invalidRows = result.rows.filter((r) => r.status === "INVALID");

    const importHistory = await prisma.$transaction(async (tx) => {
        const history = await tx.importHistory.create({
            data: {
                configurationId: config.id,
                fileName: file.name,
                uploadedById: session.userId,
                totalRows: result.rows.length,
                successRows: validRows.length,
                failedRows: invalidRows.length,
                status: "COMPLETED",
            },
        });

        if (validRows.length > 0) {
            await tx.importedRecord.createMany({
                data: validRows.map((r) => ({
                    importHistoryId: history.id,
                    rowNumber: r.rowNumber,
                    data: r.data as any,
                    status: "SUCCESS",
                })),
            });
        }

        if (invalidRows.length > 0) {
            const errorEntries = invalidRows.flatMap((r) =>
                r.errors.map((e) => {
                    // Penanganan agar nilai value tidak berubah menjadi [object Object]
                    let formattedValue = e.value;
                    if (formattedValue !== null && typeof formattedValue === "object") {
                        formattedValue = JSON.stringify(formattedValue);
                    } else {
                        formattedValue = String(formattedValue ?? "-");
                    }

                    return {
                        importHistoryId: history.id,
                        row: r.rowNumber,
                        field: e.field,
                        value: formattedValue,
                        message: e.message,
                    };
                })
            );
            await tx.importError.createMany({ data: errorEntries });
        }

        return history;
    });

    return NextResponse.json({ importHistoryId: importHistory.id }, { status: 201 });
}