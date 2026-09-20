import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

const mono = "font-[family-name:var(--font-mono)]";

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "COMPLETED";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isCompleted
          ? "bg-[#E6EEEA] text-[#2F5D4E]"
          : "bg-[#F5E6E3] text-[#A23B2E]"
      }`}
    >
      {isCompleted ? "Selesai" : "Gagal"}
    </span>
  );
}

export default async function ImportResultPage({
  params,
}: {
  params: Promise<{ historyId: string }>;
}) {
  const { historyId } = await params;

  const history = await prisma.importHistory.findUnique({
    where: { id: historyId },
    include: { configuration: true, errors: { orderBy: { row: "asc" } } },
  });

  if (!history) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/import/history"
        className="inline-flex items-center gap-2 text-sm text-[#6B6863] transition-colors hover:text-[#181B1E]"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Riwayat Import
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Detail hasil import
          </h1>
          <p className="mt-2 text-sm text-[#6B6863]">
            Rincian proses untuk file{" "}
            <span className={`text-[#181B1E] ${mono}`}>{history.fileName}</span>
          </p>
        </div>
        <a href={`/api/import/history/${history.id}/download`}>
          <Button className="gap-2 rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]">
            <Download className="h-4 w-4" />
            Download Laporan
          </Button>
        </a>
      </div>

      {/* Overview */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#6B6863]" />
            <h2 className="text-lg font-semibold">
              {history.configuration.name}
            </h2>
          </div>
          <StatusPill status={history.status} />
        </div>
        <p className="mt-1 text-sm text-[#6B6863]">
          Diunggah pada{" "}
          {new Date(history.uploadedAt).toLocaleString("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </p>

        <div className="mt-8 flex flex-wrap gap-16">
          <div>
            <p className="text-sm text-[#6B6863]">Total baris</p>
            <p className={`mt-2 text-4xl font-medium ${mono}`}>
              {history.totalRows}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#6B6863]">Baris sukses</p>
            <p
              className={`mt-2 flex items-center gap-2 text-4xl font-medium text-[#2F5D4E] ${mono}`}
            >
              <CheckCircle2 className="h-6 w-6" />
              {history.successRows}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#6B6863]">Baris gagal</p>
            <p
              className={`mt-2 flex items-center gap-2 text-4xl font-medium text-[#A23B2E] ${mono}`}
            >
              <AlertCircle className="h-6 w-6" />
              {history.failedRows}
            </p>
          </div>
        </div>
      </div>

      {/* Error detail / empty state */}
      {history.errors.length > 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#A23B2E]">
            <AlertCircle className="h-5 w-5" />
            Rincian error ({history.errors.length} masalah ditemukan)
          </h2>
          <p className="mt-1 text-sm text-[#6B6863]">
            Baris data yang gagal divalidasi beserta alasannya.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[#6B6863]">
                  <th className="px-4 py-2.5 font-medium">Row</th>
                  <th className="px-4 py-2.5 font-medium">Field</th>
                  <th className="px-4 py-2.5 font-medium">Value</th>
                  <th className="px-4 py-2.5 font-medium">Pesan Error</th>
                </tr>
              </thead>
              <tbody>
                {history.errors.map((err, index) => (
                  <tr
                    key={err.id}
                    className={index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"}
                  >
                    <td
                      className={`rounded-l-lg px-4 py-3 text-[#6B6863] ${mono}`}
                    >
                      #{err.row}
                    </td>
                    <td className={`px-4 py-3 font-medium ${mono}`}>
                      {err.field}
                    </td>
                    <td
                      className={`max-w-[200px] truncate px-4 py-3 text-[#6B6863] ${mono}`}
                      title={err.value ?? undefined}
                    >
                      {err.value}
                    </td>
                    <td className="rounded-r-lg px-4 py-3 text-xs text-[#A23B2E]">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3 rounded-2xl bg-[#E6EEEA] p-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#2F5D4E]" />
          <h3 className="text-lg font-semibold text-[#264B3F]">
            Tidak ada error
          </h3>
          <p className="mx-auto max-w-md text-sm text-[#2F5D4E]">
            Seluruh baris data pada file ini berhasil divalidasi dan dimasukkan
            ke dalam sistem tanpa ada kesalahan.
          </p>
        </div>
      )}
    </div>
  );
}
