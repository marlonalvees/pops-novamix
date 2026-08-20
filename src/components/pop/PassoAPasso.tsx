"use client";

import { useState } from "react";
import type { PopPasso } from "@/types/pop";

type PassoAPassoProps = {
  passos: PopPasso[];
};

function ChevronIcon({ direction }: { direction: "down" | "up" }) {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "down" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
      />
    </svg>
  );
}

export function PassoAPasso({ passos }: PassoAPassoProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-text">Passo a passo</h2>

      {!aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-2 flex items-center gap-2 text-sm font-medium text-orange-base hover:underline"
        >
          <span className="h-px w-4 bg-orange-base/40" aria-hidden="true" />
          Ver passo a passo ({passos.length})
          <ChevronIcon direction="down" />
        </button>
      )}

      {aberto && (
        <div className="relative mt-4">
          <div
            className="absolute left-3 top-3 bottom-3 w-px bg-orange-base/25"
            aria-hidden="true"
          />
          <ol className="flex flex-col gap-6">
            {passos.map((passo, index) => (
              <li key={passo.id ?? index} className="relative flex gap-3 pl-8">
                <span className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-orange-base text-white text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-text pt-0.5">
                    {passo.descricao}
                  </span>
                  {passo.imagens.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {passo.imagens.map((imagem) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={imagem.id}
                          src={imagem.url}
                          alt={imagem.legenda ?? `Imagem do passo ${index + 1}`}
                          className="w-full max-w-lg rounded-lg border border-gray-base/20 object-contain"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setAberto(false)}
            className="mt-4 flex items-center gap-2 pl-8 text-sm font-medium text-orange-base hover:underline"
          >
            <ChevronIcon direction="up" />
            Ocultar passo a passo
          </button>
        </div>
      )}
    </section>
  );
}
