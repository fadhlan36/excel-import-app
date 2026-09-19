"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DATA_TYPES, VALIDATION_TYPES } from "@/lib/constants";

const fieldMappingSchema = z.object({
  excelColumn: z.string().min(1, "Wajib diisi"),
  targetField: z
    .string()
    .min(1, "Wajib diisi")
    .regex(/^[a-z][a-z0-9_]*$/, "Huruf kecil & underscore, contoh: first_name"),
  dataType: z.enum(DATA_TYPES),
  isRequired: z.boolean(),
  validationType: z.enum(VALIDATION_TYPES),
});

const configSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
  targetData: z.string().min(1, "Target data wajib diisi"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  fieldMappings: z.array(fieldMappingSchema).min(1, "Minimal 1 field mapping"),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

const emptyMapping = {
  excelColumn: "",
  targetField: "",
  dataType: "STRING" as const,
  isRequired: false,
  validationType: "NONE" as const,
};

export function ConfigurationForm({
  initialData,
  configId,
}: {
  initialData?: ConfigFormValues;
  configId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      targetData: "",
      status: "ACTIVE",
      fieldMappings: [emptyMapping],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fieldMappings",
  });

  async function onSubmit(values: ConfigFormValues) {
    setSubmitting(true);
    setServerError(null);

    const url = configId
      ? `/api/configurations/${configId}`
      : "/api/configurations";
    const method = configId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setServerError(data.message || "Gagal menyimpan konfigurasi");
      return;
    }

    router.push("/admin/configurations");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Konfigurasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Employee Import" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Import data employee dari excel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Data</FormLabel>
                  <FormControl>
                    <Input placeholder="employee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>Status Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value === "ACTIVE"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "ACTIVE" : "INACTIVE")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Excel Column</TableHead>
                  <TableHead>Target Field</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((mappingField, index) => (
                  <TableRow key={mappingField.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.excelColumn`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.targetField`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="firstname" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.dataType`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATA_TYPES.map((dt) => (
                                <SelectItem key={dt} value={dt}>
                                  {dt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.isRequired`}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.validationType`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VALIDATION_TYPES.map((vt) => (
                                <SelectItem key={vt} value={vt}>
                                  {vt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => append(emptyMapping)}
            >
              + Tambah Mapping
            </Button>
          </CardContent>
        </Card>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
      </form>
    </Form>
  );
}
