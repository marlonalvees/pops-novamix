"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PopForm from "@/components/admin/PopForm";

type NovoPopClientProps = {
  categoriaFixa: string | null;
  categoriasDisponiveis: { id: number; nome: string }[];
  tagsDisponiveis: { id: number; nome: string }[];
};

export default function NovoPopClient({
  categoriaFixa,
  categoriasDisponiveis,
  tagsDisponiveis,
}: NovoPopClientProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);

    const res = await fetch("/api/pops", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.error ?? "Erro ao cadastrar POP.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <>
      {erro && <p className="mb-4 text-sm text-red-base">{erro}</p>}
      <PopForm
        categoriaFixa={categoriaFixa}
        categoriasDisponiveis={categoriasDisponiveis}
        tagsDisponiveis={tagsDisponiveis}
        submitLabel="Cadastrar"
        onSubmit={handleSubmit}
      />
    </>
  );
}
