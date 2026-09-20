import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, UploadCloud, ArrowUpRight } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

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

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [activeConfigs, totalImportsUser, myLastImports] = await Promise.all([
    prisma.importConfiguration.count({ where: { status: "ACTIVE" } }),
    prisma.importHistory.count({ where: { uploadedById: session.userId } }),
    prisma.importHistory.findMany({
      where: { uploadedById: session.userId },
      orderBy: { uploadedAt: "desc" },
      take: 3,
      include: { configuration: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-[#6B6863]">
            Selamat datang kembali, {session.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/import">
            <Button
              size="lg"
              className="gap-2 rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]"
            >
              <UploadCloud className="h-4 w-4" />
              Import Baru
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Ringkasan */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm sm:flex-row sm:gap-16">
        <div>
          <p className="text-sm text-[#6B6863]">Konfigurasi aktif</p>
          <p className={`mt-2 text-5xl font-medium ${mono}`}>{activeConfigs}</p>
        </div>
        <div>
          <p className="text-sm text-[#6B6863]">Total import Anda</p>
          <p className={`mt-2 text-5xl font-medium ${mono}`}>
            {totalImportsUser}
          </p>
        </div>
      </div>

      {/* Riwayat */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">3 import terakhir</h2>
          {myLastImports.length > 0 && (
            <Link
              href="/import/history"
              className="flex items-center gap-1 text-sm text-[#6B6863] transition-colors hover:text-[#181B1E]"
            >
              Lihat semua riwayat
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-[#6B6863]">
          File Excel yang terakhir Anda unggah dan proses.
        </p>

        {myLastImports.length === 0 ? (
          <div className="mt-5 space-y-3 rounded-2xl bg-white py-16 text-center shadow-sm">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-[#C9C6BD]" />
            <div className="space-y-1">
              <p className="text-base font-medium">
                Belum ada import yang tercatat
              </p>
              <p className="text-sm text-[#6B6863]">
                Unggah file Excel pertama Anda untuk mulai mengisi riwayat ini.
              </p>
            </div>
            <Link href="/import" className="inline-block pt-2">
              <Button size="lg" variant="outline" className="rounded-full">
                Mulai import
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {myLastImports.map((h) => {
              const formattedDate = new Date(h.uploadedAt).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-base font-medium">
                      {h.configuration.name}
                    </p>
                    <p className={`truncate text-xs text-[#6B6863] ${mono}`}>
                      {h.fileName} — {formattedDate}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    <p className={`hidden text-sm sm:block ${mono}`}>
                      <span className="text-[#2F5D4E]">
                        {h.successRows} sukses
                      </span>
                      <span className="text-[#6B6863]"> / </span>
                      <span className="text-[#A23B2E]">
                        {h.failedRows} gagal
                      </span>
                    </p>
                    <StatusPill status={h.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
