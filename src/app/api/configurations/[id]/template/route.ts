import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ExcelJS from "exceljs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const config = await prisma.importConfiguration.findUnique({
        where: { id },
        include: {
            fieldMappings: {
                orderBy: { columnOrder: "asc" },
            },
        },
    });

    if (!config || config.status !== "ACTIVE") {
        return NextResponse.json({ message: "Konfigurasi tidak ditemukan / tidak aktif" }, { status: 404 });
    }

    // Buat Workbook Excel baru menggunakan exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template Data");

    // Ambil header dari fieldMappings (kolom excel / field name)
    const headers = config.fieldMappings.map((mapping) => mapping.excelColumn);

    // Tambahkan header row
    const headerRow = worksheet.addRow(headers);

    // Styling Header agar terlihat profesional (warna gelap, teks putih, tebal)
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "1F2937" }, // Warna abu-abu gelap (Tailwind gray-800)
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Berikan lebar kolom otomatis / minimum agar rapi
    worksheet.columns.forEach((column) => {
        column.width = 25;
    });

    // Generate buffer file Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Format nama file agar bersih dari spasi/karakter khusus
    const safeTitle = config.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Template_Import_${safeTitle}.xlsx`;

    // Kirim response sebagai file download
    return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
    });
}