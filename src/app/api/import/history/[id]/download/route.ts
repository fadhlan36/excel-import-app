import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const historyId = resolvedParams.id;

        if (!historyId) {
            return NextResponse.json({ message: "History ID is missing" }, { status: 400 });
        }

        // Ambil data history beserta records (data sukses) dan errors (data gagal)
        const history = await prisma.importHistory.findUnique({
            where: { id: historyId },
            include: {
                records: true,
                errors: true,
                configuration: { select: { name: true } },
            },
        });

        if (!history) {
            return NextResponse.json({ message: "History not found" }, { status: 404 });
        }

        // 1. Menyusun data sukses yang berhasil masuk ke database
        const successData = history.records.map((rec) => {
            const rowData = rec.data as Record<string, any>;
            return {
                Row: rec.rowNumber,
                Status: "SUCCESS",
                ...rowData, // Memunculkan kolom asli seperti first_name, email, dll yang berhasil di-import
            };
        });
        successData.sort((a, b) => a.Row - b.Row);

        // 2. Menyusun data error report sesuai requirement (Row, Field, Value, Error)
        const errorData = history.errors.map((err) => ({
            Row: err.row,
            Field: err.field,
            Value: err.value || "-",
            Error: err.message,
        }));
        errorData.sort((a, b) => a.Row - b.Row);

        // Buat Workbook Excel baru
        const workbook = XLSX.utils.book_new();

        // Buat Sheet 1: Success Records (Berisi data asli yang berhasil masuk)
        const successSheet = XLSX.utils.json_to_sheet(
            successData.length > 0 ? successData : [{ Info: "Tidak ada data yang berhasil di-import" }]
        );
        XLSX.utils.book_append_sheet(workbook, successSheet, "Success Records");

        // Buat Sheet 2: Error Report (Berisi rincian baris yang gagal dengan format Row, Field, Value, Error)
        const errorSheet = XLSX.utils.json_to_sheet(
            errorData.length > 0 ? errorData : [{ Info: "Tidak ada error/seluruh data valid" }]
        );
        XLSX.utils.book_append_sheet(workbook, errorSheet, "Error Report");

        // Convert workbook ke format buffer Excel (.xlsx)
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        // Kirim file sebagai response download
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="Import-Report-${historyId}.xlsx"`,
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mendownload report", error: error.message },
            { status: 500 }
        );
    }
}