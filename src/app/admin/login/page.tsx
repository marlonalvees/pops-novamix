"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: autenticar com Supabase quando o backend estiver conectado.
    router.push("/admin");
  }

  return (
    <main className="flex-1 w-full flex items-center justify-center bg-gradient-to-br from-orange-base to-gray-base px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-3 rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-2 text-center">
          <h1 className="text-lg font-bold">
            <span className="text-orange-base">POPs</span>{" "}
            <span className="text-gray-dark">Novamix</span>
          </h1>
          <p className="text-xs text-gray-dark mt-1">Área administrativa</p>
        </div>

        <Input
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-2">
          Entrar
        </Button>
      </form>
    </main>
  );
}
