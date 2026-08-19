"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PopForm from "@/components/admin/PopForm";
import type { Pop } from "@/types/pop";

type EditPopClientProps = {
  pop: Pop;
  categoriaFixa: string | null;
  categoriasDisponiveis: { id: number; nome: string }[];
};

export default function EditPopClient({
  pop,
  categoriaFixa,
  categoriasDisponiveis,
}: EditPopClientProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);

    const res = await fetch(`/api/pops/${pop.slug}`, { method: "PUT", body: formData });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.error ?? "Erro ao salvar alterações.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <>
      {erro && <p className="mb-4 text-sm text-red-base">{erro}</p>}
      <PopForm
        initialValues={pop}
        categoriaFixa={categoriaFixa}
        categoriasDisponiveis={categoriasDisponiveis}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
      />
    </>
  );
}
