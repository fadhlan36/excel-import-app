"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadTemplateButton({ configId }: { configId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`/api/configurations/${configId}/template`);

      if (!res.ok) {
        throw new Error("Gagal mengunduh template");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "Template_Import.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengunduh template.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownloadTemplate}
      disabled={downloading}
      className="gap-2 shrink-0"
    >
      <Download className="w-4 h-4" />
      {downloading ? "Mengunduh..." : "Download Template"}
    </Button>
  );
}
