import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Download, FileText, ArrowLeft } from "lucide-react";

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

export default async function ImportHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const histories = await prisma.importHistory.findMany({
    where: session.role === "ADMIN" ? {} : { uploadedById: session.userId },
    include: {
      configuration: { select: { name: true } },
      uploadedBy: { select: { name: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      {/* Tombol Kembali ke Dashboard */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B6863] transition-colors hover:text-[#181B1E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="pb-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Riwayat import
        </h1>
        <p className="mt-2 text-sm text-[#6B6863]">
          Daftar seluruh aktivitas import data dan unduh laporan hasil
          prosesnya.
        </p>
      </div>

      {histories.length === 0 ? (
        <div className="space-y-3 rounded-2xl bg-white py-16 text-center shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-[#C9C6BD]" />
          <p className="text-sm font-medium text-[#6B6863]">
            Belum ada riwayat import data.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="text-xs text-[#6B6863]">
                  <th className="px-4 py-2.5 font-medium">ID Import</th>
                  <th className="px-4 py-2.5 font-medium">Konfigurasi</th>
                  <th className="px-4 py-2.5 font-medium">Nama File</th>
                  <th className="px-4 py-2.5 font-medium">Pengunggah</th>
                  <th className="px-4 py-2.5 font-medium">Waktu</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Sukses</th>
                  <th className="px-4 py-2.5 font-medium">Gagal</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((h, index) => (
                  <tr
                    key={h.id}
                    className={index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"}
                  >
                    <td
                      className={`rounded-l-lg px-4 py-3 text-xs text-[#6B6863] ${mono}`}
                    >
                      #{h.id.slice(0, 6)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {h.configuration.name}
                    </td>
                    <td
                      className={`max-w-[160px] truncate px-4 py-3 text-[#6B6863] ${mono}`}
                      title={h.fileName}
                    >
                      {h.fileName}
                    </td>
                    <td className="px-4 py-3">{h.uploadedBy.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#6B6863]">
                      {new Date(h.uploadedAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className={`px-4 py-3 ${mono}`}>{h.totalRows}</td>
                    <td
                      className={`px-4 py-3 font-medium text-[#2F5D4E] ${mono}`}
                    >
                      {h.successRows}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium text-[#A23B2E] ${mono}`}
                    >
                      {h.failedRows}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={h.status} />
                    </td>
                    <td className="rounded-r-lg px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/import/result/${h.id}`}
                          className="inline-flex h-8 items-center rounded-full bg-[#F1EFEA] px-3.5 text-xs font-medium text-[#181B1E] transition-colors hover:bg-[#E6E3DC]"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/api/import/history/${h.id}/download`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#F1EFEA] px-3.5 text-xs font-medium text-[#181B1E] transition-colors hover:bg-[#E6E3DC]"
                        >
                          <Download className="h-3 w-3" />
                          Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
