"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeletePopButtonProps = {
  slug: string;
  titulo: string;
};

export default function DeletePopButton({ slug, titulo }: DeletePopButtonProps) {
  const [excluindo, setExcluindo] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Excluir o POP "${titulo}"? Essa ação não pode ser desfeita.`)) return;

    setExcluindo(true);
    try {
      const res = await fetch(`/api/pops/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Erro ao excluir POP.");
        return;
      }
      router.refresh();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={excluindo}
      className="rounded-md px-3 py-1.5 text-xs font-medium border border-red-base/30 text-red-base hover:bg-red-base hover:text-white transition disabled:opacity-50"
    >
      {excluindo ? "Excluindo..." : "Excluir"}
    </button>
  );
}
