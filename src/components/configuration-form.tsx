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

const fieldClass =
  "border-0 bg-[#FAFAF8] rounded-xl focus-visible:ring-2 focus-visible:ring-[#2F5D4E] focus-visible:ring-offset-0";

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

    try {
      const url = configId
        ? `/api/configurations/${configId}`
        : "/api/configurations";
      const method = configId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errorMessage = "Gagal menyimpan konfigurasi";
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // Ignore JSON parse error if response is not JSON
        }
        setServerError(errorMessage);
        setSubmitting(false);
        return;
      }

      router.push("/admin/configurations");
      router.refresh();
    } catch (err) {
      setServerError("Terjadi kesalahan jaringan atau server.");
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Konfigurasi */}
        <div className="space-y-5 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Informasi konfigurasi</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-[#6B6863]">
                  Configuration Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Employee Import"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-[#A23B2E]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-[#6B6863]">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Import data employee dari excel"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-[#A23B2E]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetData"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-[#6B6863]">
                  Target Data
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="employee"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-[#A23B2E]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl bg-[#FAFAF8] p-4">
                <FormLabel className="text-sm">Status Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === "ACTIVE"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "ACTIVE" : "INACTIVE")
                    }
                    className="data-[state=checked]:bg-[#2F5D4E]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Field Mapping */}
        <div className="space-y-5 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Field mapping</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs text-[#6B6863]">
                  <th className="px-3 py-2 font-medium">Excel Column</th>
                  <th className="px-3 py-2 font-medium">Target Field</th>
                  <th className="px-3 py-2 font-medium">Data Type</th>
                  <th className="px-3 py-2 font-medium">Required</th>
                  <th className="px-3 py-2 font-medium">Validation</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {fields.map((mappingField, index) => (
                  <tr
                    key={mappingField.id}
                    className={index % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"}
                  >
                    <td className="rounded-l-lg px-3 py-2.5">
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.excelColumn`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="First Name"
                                className={`${fieldClass} bg-white`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-[#A23B2E]" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.targetField`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="firstname"
                                className={`${fieldClass} bg-white`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-[#A23B2E]" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.dataType`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-[130px] border-0 bg-white focus:ring-2 focus:ring-[#2F5D4E]">
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
                    </td>
                    <td className="px-3 py-2.5">
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.isRequired`}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#2F5D4E]"
                          />
                        )}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <FormField
                        control={form.control}
                        name={`fieldMappings.${index}.validationType`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-[110px] border-0 bg-white focus:ring-2 focus:ring-[#2F5D4E]">
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
                    </td>
                    <td className="rounded-r-lg px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-xs font-medium text-[#A23B2E] hover:underline disabled:cursor-not-allowed disabled:text-[#C9C6BD] disabled:no-underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            onClick={() => append(emptyMapping)}
            className="rounded-full bg-[#F1EFEA] text-[#181B1E] shadow-none hover:bg-[#E6E3DC]"
          >
            + Tambah Mapping
          </Button>
        </div>

        {serverError && <p className="text-sm text-[#A23B2E]">{serverError}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]"
        >
          {submitting ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
      </form>
    </Form>
  );
}
