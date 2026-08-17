"use client";

import { useRouter } from "next/navigation";
import PopForm from "@/components/admin/PopForm";

export default function NovoPopPage() {
  const router = useRouter();

  function handleSubmit() {
    // TODO: salvar no Supabase quando o backend estiver conectado.
    router.push("/admin");
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text mb-6">
        Novo POP
      </h1>

      <PopForm submitLabel="Cadastrar" onSubmit={handleSubmit} />
    </main>
  );
}
