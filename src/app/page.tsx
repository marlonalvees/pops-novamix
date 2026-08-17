"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
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

      <ul className="mt-6 flex flex-col gap-2">
        {resultados.map((pop) => (
          <li
            key={pop.slug}
            className="rounded-lg border border-gray-base/20 bg-white px-4 py-3 text-sm text-gray-text"
          >
            <span className="font-medium">{pop.titulo}</span>
            <span className="ml-2 text-xs text-gray-dark">
              {pop.categoria}
            </span>
          </li>
        ))}

        {resultados.length === 0 && (
          <li className="text-sm text-gray-dark py-6 text-center">
            Nenhum procedimento encontrado para &quot;{query}&quot;.
          </li>
        )}
      </ul>
    </main>
  );
}
