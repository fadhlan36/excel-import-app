import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImportWorkflow } from "@/components/import-workflow";

export default async function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const config = await prisma.importConfiguration.findUnique({
    where: { id },
  });
  if (!config || config.status !== "ACTIVE") notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{config.name}</h1>
        <p className="mt-2 text-sm text-[#6B6863]">{config.description}</p>
      </div>
      <ImportWorkflow configId={config.id} />
    </div>
  );
}
