"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import PopCard from "@/components/PopCard";
import { mockPops } from "@/lib/mock-pops";

export default function Home() {
  const [query, setQuery] = useState("");

  const resultados = useMemo(() => {
    const termo = query.trim().toLowerCase();
    if (!termo) return mockPops;

    return mockPops.filter((pop) => {
      const alvo = [pop.titulo, pop.categoria, ...pop.tags]
        .join(" ")
        .toLowerCase();
      return alvo.includes(termo);
    });
  }, [query]);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text mb-1">
        Como podemos ajudar?
      </h1>
      <p className="text-sm text-gray-dark mb-6">
        Busque pelo procedimento ou problema que você está enfrentando.
      </p>

      <SearchBar value={query} onChange={setQuery} />

      {resultados.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultados.map((pop) => (
            <PopCard key={pop.slug} pop={pop} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-dark py-6 text-center">
          Nenhum procedimento encontrado para &quot;{query}&quot;.
        </p>
      )}
    </main>
  );
}
