import { ConfigurationForm } from "@/components/configuration-form";

export default function NewConfigurationPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Buat import configuration
      </h1>
      <ConfigurationForm />
    </div>
  );
}
