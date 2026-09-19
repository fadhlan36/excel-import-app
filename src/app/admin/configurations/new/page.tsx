import { ConfigurationForm } from "@/components/configuration-form";

export default function NewConfigurationPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Buat Import Configuration</h1>
      <ConfigurationForm />
    </div>
  );
}
