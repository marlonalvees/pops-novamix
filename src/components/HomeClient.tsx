"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import PopCard from "@/components/PopCard";
import type { PopResumo } from "@/types/pop";

type HomeClientProps = {
  pops: PopResumo[];
  categorias: string[];
};

export default function HomeClient({ pops, categorias }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  const resultados = useMemo(() => {
    const termo = query.trim().toLowerCase();

    return pops.filter((pop) => {
      if (categoria && pop.categoria !== categoria) return false;
      if (!termo) return true;

      const alvo = [pop.titulo, pop.categoria, ...pop.tags].join(" ").toLowerCase();
      return alvo.includes(termo);
    });
  }, [pops, query, categoria]);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text mb-1">
        Como podemos ajudar?
      </h1>
      <p className="text-sm text-gray-dark mb-6">
        Busque pelo procedimento ou problema que você está enfrentando.
      </p>

      <SearchBar value={query} onChange={setQuery} />

      <div className="mt-4">
        <CategoryFilter
          categorias={categorias}
          selecionada={categoria}
          onSelect={setCategoria}
        />
      </div>

      {resultados.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultados.map((pop) => (
            <PopCard key={pop.slug} pop={pop} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-dark py-6 text-center">
          Nenhum procedimento encontrado{query ? ` para "${query}"` : ""}.
        </p>
      )}
    </main>
  );
}
