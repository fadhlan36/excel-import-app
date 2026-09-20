import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText } from "lucide-react";

const mono = "font-[family-name:var(--font-mono)]";

function DataTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#F1EFEA] px-2.5 py-1 text-[11px] text-[#6B6863] ${mono}`}
    >
      {type}
    </span>
  );
}

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        required ? "bg-[#E6EEEA] text-[#2F5D4E]" : "bg-[#F1EFEA] text-[#6B6863]"
      }`}
    >
      {required ? "Wajib" : "Opsional"}
    </span>
  );
}

export default async function ImportListPage() {
  const configs = await prisma.importConfiguration.findMany({
    where: { status: "ACTIVE" },
    include: {
      fieldMappings: { orderBy: { columnOrder: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pilih jenis data yang ingin diimport
        </h1>
        <p className="mt-2 text-sm text-[#6B6863]">
          Pilih jenis data di bawah ini, lalu sesuaikan file Excel Anda dengan
          ketentuan kolom yang tertera.
        </p>
      </div>

      {configs.length === 0 ? (
        <div className="space-y-3 rounded-2xl bg-white py-16 text-center shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-[#C9C6BD]" />
          <p className="text-sm font-medium text-[#6B6863]">
            Belum ada jenis import data yang aktif saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {configs.map((config) => (
            <div key={config.id} className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{config.name}</h2>
                  {config.description && (
                    <p className="mt-1 text-sm text-[#6B6863]">
                      {config.description}
                    </p>
                  )}
                </div>
                <Link href={`/import/${config.id}`}>
                  <Button className="gap-2 rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]">
                    <UploadCloud className="h-4 w-4" />
                    Gunakan Jenis Ini
                  </Button>
                </Link>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm text-[#6B6863]">
                  Ketentuan kolom Excel
                </p>
                <div className="overflow-hidden rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-[#6B6863]">
                        <th className="px-4 py-2.5 font-medium">Nama Field</th>
                        <th className="px-4 py-2.5 font-medium">
                          Nama Kolom Excel
                        </th>
                        <th className="px-4 py-2.5 font-medium">Format Data</th>
                        <th className="px-4 py-2.5 font-medium">
                          Wajib Diisi?
                        </th>
                        <th className="px-4 py-2.5 font-medium">
                          Aturan Khusus
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.fieldMappings.map((mapping, index) => (
                        <tr
                          key={mapping.id}
                          className={
                            index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"
                          }
                        >
                          <td className="rounded-l-lg px-4 py-3 font-medium">
                            {mapping.targetField || "-"}
                          </td>
                          <td className={`px-4 py-3 text-[#6B6863] ${mono}`}>
                            {mapping.excelColumn}
                          </td>
                          <td className="px-4 py-3">
                            <DataTypeBadge
                              type={String(mapping.dataType || "STRING")}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <RequiredBadge required={mapping.isRequired} />
                          </td>
                          <td
                            className={`rounded-r-lg px-4 py-3 text-[#6B6863] ${mono}`}
                          >
                            {mapping.validationType &&
                            mapping.validationType !== "NONE"
                              ? String(mapping.validationType)
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
