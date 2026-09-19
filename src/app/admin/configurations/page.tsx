import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ConfigActions } from "@/components/config-actions";

// Server Component: query prisma langsung, tidak perlu lewat fetch ke API sendiri
export default async function ConfigurationsPage() {
  const configs = await prisma.importConfiguration.findMany({
    include: { fieldMappings: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import Configurations</h1>
        <Link href="/admin/configurations/new">
          <Button>+ New Configuration</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Target Data</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell>{config.name}</TableCell>
              <TableCell>{config.targetData}</TableCell>
              <TableCell>{config.fieldMappings.length}</TableCell>
              <TableCell>
                <Badge
                  variant={config.status === "ACTIVE" ? "default" : "secondary"}
                >
                  {config.status}
                </Badge>
              </TableCell>
              <TableCell>{config.createdBy.name}</TableCell>
              <TableCell>
                <ConfigActions configId={config.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
