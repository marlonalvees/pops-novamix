"use client";

import { useRouter } from "next/navigation";
import PopForm from "@/components/admin/PopForm";
import type { Pop } from "@/types/pop";

type EditPopClientProps = {
  pop: Pop;
};

export default function EditPopClient({ pop }: EditPopClientProps) {
  const router = useRouter();

  function handleSubmit() {
    // TODO: atualizar no Supabase quando o backend estiver conectado.
    router.push("/admin");
  }

  return (
    <PopForm
      initialValues={pop}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
