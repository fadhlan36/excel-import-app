"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

const fieldClass =
  "border-0 bg-[#FAFAF8] rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-[#2F5D4E] focus-visible:ring-offset-0";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    setErrorMsg(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(data.message || "Login gagal");
      return;
    }

    router.push(
      data.user.role === "ADMIN" ? "/admin/configurations" : "/dashboard",
    );
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-[#6B6863]">
          Masuk untuk melanjutkan ke Import Engine.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#6B6863]">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@example.com"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-[#6B6863]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input type="password" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-[#A23B2E]" />
                </FormItem>
              )}
            />
            {errorMsg && <p className="text-sm text-[#A23B2E]">{errorMsg}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]"
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-[#6B6863]">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-[#2F5D4E] hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
