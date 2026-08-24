"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import DeletePopButton from "@/components/admin/DeletePopButton";
import type { PopResumo } from "@/types/pop";

type AdminPopsListProps = {
  pops: PopResumo[];
};

export default function AdminPopsList({ pops }: AdminPopsListProps) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pops;

    return pops.filter((pop) => {
      const alvo = [pop.titulo, pop.categoria, ...pop.tags].join(" ").toLowerCase();
      return alvo.includes(termo);
    });
  }, [pops, busca]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por título, categoria ou tag..."
      />

      <div className="rounded-xl border border-gray-base/20 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-base/20 text-left text-xs uppercase text-gray-dark">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((pop) => (
              <tr key={pop.slug} className="border-b border-gray-base/10 last:border-0">
                <td className="px-4 py-3 text-gray-text">
                  <div className="flex items-center gap-2">
                    {pop.titulo}
                    {pop.privado && (
                      <span
                        title="POP privado"
                        className="rounded-full bg-gray-text/10 text-gray-dark text-xs font-medium px-2 py-0.5"
                      >
                        Privado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-orange-base/10 text-orange-base text-xs font-medium px-2 py-1">
                    {pop.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/pops/${pop.slug}`}
                      className="rounded-md px-3 py-1.5 text-xs font-medium border border-gray-base/30 text-gray-dark hover:border-orange-base hover:text-orange-base transition"
                    >
                      Editar
                    </Link>
                    <DeletePopButton slug={pop.slug} titulo={pop.titulo} />
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-dark">
                  Nenhum POP encontrado{busca ? ` para "${busca}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
