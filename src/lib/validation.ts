export type FieldMappingLike = {
    excelColumn: string;
    targetField: string;
    dataType: "STRING" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "DATE" | "DATETIME";
    isRequired: boolean;
    validationType: "NONE" | "UNIQUE" | "EMAIL" | "DATE";
};

export type ValidationError = { field: string; value: string; message: string };
export type RowValidationResult = {
    data: Record<string, unknown>;
    errors: ValidationError[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRow(
    rawRow: Record<string, string>,
    mappings: FieldMappingLike[],
    uniqueTracker: Map<string, Set<string>>
): RowValidationResult {
    const data: Record<string, unknown> = {};
    const errors: ValidationError[] = [];

    for (const mapping of mappings) {
        const rawValue = (rawRow[mapping.excelColumn] ?? "").toString().trim();

        // 1. Required
        if (mapping.isRequired && rawValue === "") {
            errors.push({
                field: mapping.targetField,
                value: rawValue,
                message: `${mapping.excelColumn} is required`,
            });
            continue;
        }

        if (rawValue === "") {
            data[mapping.targetField] = null;
            continue; // field optional yang kosong, tidak perlu divalidasi lebih lanjut
        }

        // 2. Data Type
        const coerced = coerceValue(rawValue, mapping.dataType);
        if (coerced === undefined) {
            errors.push({
                field: mapping.targetField,
                value: rawValue,
                message: `Invalid ${mapping.dataType.toLowerCase()} format`,
            });
            continue;
        }

        // 3. Validation Type tambahan
        if (mapping.validationType === "EMAIL" && !EMAIL_REGEX.test(rawValue)) {
            errors.push({ field: mapping.targetField, value: rawValue, message: "Invalid email format" });
            continue;
        }

        if (mapping.validationType === "UNIQUE") {
            const seen = uniqueTracker.get(mapping.targetField) ?? new Set<string>();
            if (seen.has(rawValue)) {
                errors.push({ field: mapping.targetField, value: rawValue, message: "Duplicate value" });
                continue;
            }
            seen.add(rawValue);
            uniqueTracker.set(mapping.targetField, seen);
        }

        data[mapping.targetField] = coerced;
    }

    return { data, errors };
}

function coerceValue(value: string, dataType: FieldMappingLike["dataType"]): unknown {
    switch (dataType) {
        case "STRING":
            return value;
        case "INTEGER": {
            const n = Number(value);
            return Number.isInteger(n) ? n : undefined;
        }
        case "DECIMAL": {
            const n = Number(value);
            return Number.isFinite(n) ? n : undefined;
        }
        case "BOOLEAN": {
            const lower = value.toLowerCase();
            if (["true", "1", "yes"].includes(lower)) return true;
            if (["false", "0", "no"].includes(lower)) return false;
            return undefined;
        }
        case "DATE":
        case "DATETIME": {
            const date = new Date(value);
            return isNaN(date.getTime()) ? undefined : date.toISOString();
        }
        default:
            return undefined;
    }
}