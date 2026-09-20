import ExcelJS from "exceljs";
import { FieldMapping } from "@prisma/client";
import { validateRow, ValidationError } from "./validation";
import { getExistingValues } from "./unique-check";

export type ProcessedRow = {
    rowNumber: number;
    data: Record<string, unknown>;
    status: "VALID" | "INVALID";
    errors: ValidationError[];
};

export type ProcessResult =
    | { ok: false; message: string }
    | { ok: true; rows: ProcessedRow[] };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Helper aman untuk mengekstrak nilai cell ExcelJS agar tidak menjadi [object Object]
function extractCellStringValue(cellValue: any): string {
    if (cellValue === null || cellValue === undefined) {
        return "";
    }
    // Jika tipe data cell berupa objek khusus ExcelJS (seperti richText, formula result, dll)
    if (typeof cellValue === "object") {
        if ("text" in cellValue && typeof cellValue.text === "string") {
            return cellValue.text;
        }
        if ("result" in cellValue) {
            return cellValue.result !== null && cellValue.result !== undefined
                ? String(cellValue.result)
                : "";
        }
        if (Array.isArray(cellValue.richText)) {
            return cellValue.richText.map((rt: any) => rt.text || "").join("");
        }
        try {
            return JSON.stringify(cellValue);
        } catch {
            return "";
        }
    }
    return String(cellValue);
}

export async function parseAndValidateExcel(
    file: File,
    configurationId: string,
    fieldMappings: FieldMapping[]
): Promise<ProcessResult> {
    if (file.size === 0) return { ok: false, message: "File kosong" };
    if (file.size > MAX_FILE_SIZE) return { ok: false, message: "Ukuran file maksimal 10MB" };

    const isValidExtension = [".xlsx", ".xls"].some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValidExtension) return { ok: false, message: "Format file harus .xlsx atau .xls" };

    const workbook = new ExcelJS.Workbook();
    try {
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer as any);
    } catch {
        return { ok: false, message: "File tidak dapat dibaca / rusak" };
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount < 1) {
        return { ok: false, message: "File tidak memiliki data" };
    }

    const headerMap: Record<number, string> = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headerMap[colNumber] = extractCellStringValue(cell.value).trim();
    });

    const missingColumns = fieldMappings
        .map((m) => m.excelColumn)
        .filter((col) => !Object.values(headerMap).includes(col));

    if (missingColumns.length > 0) {
        return { ok: false, message: `Struktur file tidak sesuai. Kolom hilang: ${missingColumns.join(", ")}` };
    }

    const columnIndexByName: Record<string, number> = {};
    for (const [colNumber, name] of Object.entries(headerMap)) {
        columnIndexByName[name] = Number(colNumber);
    }

    const uniqueTracker = new Map<string, Set<string>>();
    for (const mapping of fieldMappings) {
        if (mapping.validationType === "UNIQUE") {
            uniqueTracker.set(mapping.targetField, await getExistingValues(configurationId, mapping.targetField));
        }
    }

    const rows: ProcessedRow[] = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rawRow: Record<string, string> = {};
        let isRowEmpty = true;

        for (const mapping of fieldMappings) {
            const cellValue = row.getCell(columnIndexByName[mapping.excelColumn]).value;
            const stringValue = extractCellStringValue(cellValue).trim();

            rawRow[mapping.excelColumn] = stringValue;
            if (stringValue !== "") isRowEmpty = false;
        }

        if (isRowEmpty) continue;

        const { data, errors } = validateRow(rawRow, fieldMappings, uniqueTracker);
        rows.push({ rowNumber, data, status: errors.length === 0 ? "VALID" : "INVALID", errors });
    }

    return { ok: true, rows };
}