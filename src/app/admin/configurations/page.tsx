import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ConfigActions } from "@/components/config-actions";
import { Plus } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const mono = "font-[family-name:var(--font-mono)]";

function StatusPill({ status }: { status: string }) {
  const isPositive =
    status === "COMPLETED" || status === "SUCCESS" || status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
        isPositive
          ? "bg-[#E6EEEA] text-[#2F5D4E]"
          : "bg-[#F5E6E3] text-[#A23B2E]"
      }`}
    >
      {status ? status.toLowerCase() : "unknown"}
    </span>
  );
}

function CountPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#F1EFEA] px-2.5 py-1 text-xs text-[#6B6863] ${mono}`}
    >
      {children}
    </span>
  );
}

export default async function ConfigurationsPage() {
  const configs = await prisma.importConfiguration.findMany({
    include: {
      fieldMappings: true,
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const importHistories = await prisma.importHistory
    .findMany({
      include: {
        uploadedBy: { select: { name: true, email: true } },
        configuration: { select: { name: true } },
      },
      orderBy: { uploadedAt: "desc" },
      take: 20,
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Konfigurasi & riwayat import
          </h1>
          <p className="mt-2 text-sm text-[#6B6863]">
            Kelola aturan pemetaan data konfigurasi dan pantau aktivitas import
            user.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/configurations/new">
            <Button className="gap-2 rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]">
              <Plus className="h-4 w-4" />
              Konfigurasi Baru
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Tabel Konfigurasi */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Daftar konfigurasi import
        </h2>

        {configs.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#6B6863] shadow-sm">
            Belum ada konfigurasi import yang tersedia.
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="text-xs text-[#6B6863]">
                    <th className="px-4 py-2.5 font-medium">
                      Nama Konfigurasi
                    </th>
                    <th className="px-4 py-2.5 font-medium">Target Data</th>
                    <th className="px-4 py-2.5 font-medium">Fields</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Dibuat Oleh</th>
                    <th className="px-4 py-2.5 font-medium">Terakhir Diubah</th>
                    <th className="px-4 py-2.5 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config, index) => {
                    const createdAtFormatted = new Date(
                      config.createdAt,
                    ).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    const updatedAtFormatted = new Date(
                      config.updatedAt,
                    ).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr
                        key={config.id}
                        className={
                          index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"
                        }
                      >
                        <td className="rounded-l-lg px-4 py-3 font-medium">
                          {config.name}
                        </td>
                        <td className={`px-4 py-3 text-[#6B6863] ${mono}`}>
                          {config.targetData}
                        </td>
                        <td className="px-4 py-3">
                          <CountPill>
                            {config.fieldMappings.length} kolom
                          </CountPill>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={config.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {config.createdBy?.name || "Sistem"}
                            </span>
                            <span className="text-xs text-[#6B6863]">
                              {createdAtFormatted}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {config.updatedBy?.name ||
                                config.createdBy?.name ||
                                "-"}
                            </span>
                            <span className="text-xs text-[#6B6863]">
                              {updatedAtFormatted}
                            </span>
                          </div>
                        </td>
                        <td className="rounded-r-lg px-4 py-3 text-right">
                          <ConfigActions configId={config.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Tabel Riwayat User */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Riwayat import user</h2>

        {importHistories.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#6B6863] shadow-sm">
            Belum ada riwayat import data dari user.
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="text-xs text-[#6B6863]">
                    <th className="px-4 py-2.5 font-medium">User</th>
                    <th className="px-4 py-2.5 font-medium">Konfigurasi</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">
                      Nama File & Statistik
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Waktu Upload
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {importHistories.map((history: any, index: number) => {
                    const uploadedAtFormatted = new Date(
                      history.uploadedAt,
                    ).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr
                        key={history.id}
                        className={
                          index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"
                        }
                      >
                        <td className="rounded-l-lg px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {history.uploadedBy?.name || "Tanpa Nama"}
                            </span>
                            <span className="text-xs text-[#6B6863]">
                              {history.uploadedBy?.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {history.configuration?.name || "Konfigurasi Dihapus"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={history.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-xs font-medium ${mono}`}>
                              {history.fileName}
                            </span>
                            <span className={`text-xs ${mono}`}>
                              <span className="text-[#2F5D4E]">
                                {history.successRows} sukses
                              </span>
                              <span className="text-[#6B6863]"> / </span>
                              <span className="text-[#A23B2E]">
                                {history.failedRows} gagal
                              </span>
                              <span className="text-[#6B6863]">
                                {" "}
                                (dari {history.totalRows})
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="rounded-r-lg px-4 py-3 text-right text-xs text-[#6B6863]">
                          {uploadedAtFormatted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
