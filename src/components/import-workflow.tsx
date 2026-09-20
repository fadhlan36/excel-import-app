"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Eye, UploadCloud, FileSpreadsheet } from "lucide-react";

const mono = "font-[family-name:var(--font-mono)]";

type PreviewRow = {
  rowNumber: number;
  data: Record<string, unknown>;
  status: "VALID" | "INVALID";
  errors: { field: string; value: string; message: string }[];
};

type PreviewResult = {
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: PreviewRow[];
};

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "moss" | "rust";
}) {
  const toneClass =
    tone === "moss"
      ? "bg-[#E6EEEA] text-[#2F5D4E]"
      : tone === "rust"
        ? "bg-[#F5E6E3] text-[#A23B2E]"
        : "bg-[#F1EFEA] text-[#6B6863]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${toneClass}`}
    >
      {label}
      <span className={mono}>{value}</span>
    </span>
  );
}

function RowStatusPill({ status }: { status: "VALID" | "INVALID" }) {
  const isValid = status === "VALID";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        isValid ? "bg-[#E6EEEA] text-[#2F5D4E]" : "bg-[#F5E6E3] text-[#A23B2E]"
      }`}
    >
      {isValid ? "Valid" : "Invalid"}
    </span>
  );
}

export function ImportWorkflow({ configId }: { configId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handlePreview() {
    if (!file) {
      setErrorMsg("Pilih file terlebih dahulu");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setPreview(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/configurations/${configId}/preview`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.message || "Gagal memproses file");
      return;
    }
    setPreview(data);
  }

  async function handleProcessImport() {
    if (!file) return;
    setImporting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/configurations/${configId}/import`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setImporting(false);

    if (!res.ok) {
      setErrorMsg(data.message || "Gagal melakukan import");
      return;
    }

    router.push(`/import/result/${data.importHistoryId}`);
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Upload file Excel</h2>
            <p className="mt-1 text-sm text-[#6B6863]">
              Gunakan template yang sesuai supaya kolom terbaca dengan benar.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={() =>
              (window.location.href = `/api/configurations/${configId}/template`)
            }
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Custom File Area tanpa tombol bawaan browser */}
          <div className="relative flex-1 flex items-center justify-between rounded-xl bg-[#FAFAF8] px-4 py-3.5 border border-[#EBE9E4] hover:border-[#2F5D4E] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileSpreadsheet className="h-5 w-5 text-[#2F5D4E] shrink-0" />
              <span className="text-sm text-[#33312C] truncate">
                {file
                  ? file.name
                  : "Klik untuk memilih file Excel (.xlsx, .xls)"}
              </span>
            </div>
            <span className="text-xs font-medium text-[#6B6863] bg-[#EFECE6] px-2.5 py-1 rounded-md shrink-0 ml-2 group-hover:bg-[#2F5D4E] group-hover:text-white transition-colors">
              {file ? "Ganti File" : "Cari File"}
            </span>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <Button
            onClick={handlePreview}
            disabled={loading}
            className="gap-2 rounded-full bg-[#4A5568] text-white hover:bg-[#3B4252] sm:w-40 shadow-sm"
          >
            <Eye className="h-4 w-4" />
            {loading ? "Memproses..." : "Preview Data"}
          </Button>
        </div>

        {errorMsg && <p className="text-sm text-[#A23B2E]">{errorMsg}</p>}
      </div>

      {/* Preview Result Section */}
      {preview && (
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-[#E6EEEA]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Preview data</h2>
            <div className="flex flex-wrap gap-2">
              <StatPill
                label="Total"
                value={preview.totalRows}
                tone="neutral"
              />
              <StatPill label="Valid" value={preview.validCount} tone="moss" />
              <StatPill
                label="Invalid"
                value={preview.invalidCount}
                tone="rust"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#F1EFEA]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAFAF8] text-xs text-[#6B6863]">
                  <th className="px-4 py-2.5 font-medium">Row</th>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, index) => (
                  <tr
                    key={row.rowNumber}
                    className={index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"}
                  >
                    <td className={`rounded-l-lg px-4 py-3 ${mono}`}>
                      {row.rowNumber}
                    </td>
                    <td
                      className={`max-w-xs truncate px-4 py-3 text-xs text-[#6B6863] ${mono}`}
                    >
                      {JSON.stringify(row.data)}
                    </td>
                    <td className="px-4 py-3">
                      <RowStatusPill status={row.status} />
                    </td>
                    <td className="rounded-r-lg px-4 py-3 text-xs text-[#A23B2E]">
                      {row.errors
                        .map((e) => `${e.field}: ${e.message}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleProcessImport}
              disabled={preview.totalRows === 0 || importing}
              size="lg"
              className="gap-2 rounded-full bg-[#2F5D4E] text-white hover:bg-[#23463B] sm:w-auto shadow-md font-semibold px-6"
            >
              <UploadCloud className="h-5 w-5" />
              {importing
                ? "Mengimport..."
                : `Process Import (${preview.validCount} Valid, ${preview.invalidCount} Invalid)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
