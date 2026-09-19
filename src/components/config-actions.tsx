"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConfigActions({ configId }: { configId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus konfigurasi ini?")) return;

    const res = await fetch(`/api/configurations/${configId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Link href={`/admin/configurations/${configId}/edit`}>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </Link>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
