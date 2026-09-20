import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfigurationForm } from "@/components/configuration-form";

export default async function EditConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const config = await prisma.importConfiguration.findUnique({
    where: { id },
    include: { fieldMappings: { orderBy: { columnOrder: "asc" } } },
  });

  if (!config) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Edit: {config.name}
      </h1>
      <ConfigurationForm
        configId={config.id}
        initialData={{
          name: config.name,
          description: config.description ?? "",
          targetData: config.targetData,
          status: config.status,
          fieldMappings: config.fieldMappings.map((fm) => ({
            excelColumn: fm.excelColumn,
            targetField: fm.targetField,
            dataType: fm.dataType,
            isRequired: fm.isRequired,
            validationType: fm.validationType,
          })),
        }}
      />
    </div>
  );
}
