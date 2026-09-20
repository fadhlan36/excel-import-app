"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass =
  "border-0 bg-[#FAFAF8] rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-[#2F5D4E] focus-visible:ring-offset-0";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daftar akun baru
        </h1>
        <p className="mt-1 text-sm text-[#6B6863]">
          Buat akun untuk mulai menggunakan Import Engine.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-[#F5E6E3] p-3 text-sm text-[#A23B2E]">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm text-[#6B6863]">Nama Lengkap</label>
            <Input
              type="text"
              placeholder="Fadhlan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[#6B6863]">Email</label>
            <Input
              type="email"
              placeholder="fadhlan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[#6B6863]">Password</label>
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full bg-[#2F5D4E] text-white hover:bg-[#264B3F]"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B6863]">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-[#2F5D4E] hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
