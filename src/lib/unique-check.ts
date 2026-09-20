import { prisma } from "./prisma";

export async function getExistingValues(
    configurationId: string,
    targetField: string
): Promise<Set<string>> {
    // Validasi sederhana untuk memastikan targetField aman dari karakter aneh
    if (!/^[a-zA-Z0-9_]+$/.test(targetField)) {
        throw new Error("Invalid target field name");
    }

    // Menggunakan template literal yang benar (${targetField}) untuk menyisipkan nama kolom dinamis
    const rows = await prisma.$queryRawUnsafe<{ value: string | null }[]>(
        `SELECT DISTINCT ir.data->>$2 as value
        FROM imported_records ir
        JOIN import_histories ih on ir."importHistoryId" = ih.id
        WHERE ih."configurationId" = $1 AND ir.status = 'SUCCESS'`,
        configurationId,
        targetField
    );

    return new Set(rows.map((r) => r.value).filter((v): v is string => v !== null));
}