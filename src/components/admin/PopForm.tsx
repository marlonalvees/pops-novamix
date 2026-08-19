"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Pop, PopImagem } from "@/types/pop";

type PassoState = {
  id?: number;
  descricao: string;
  imagensExistentes: PopImagem[];
  imagensRemovidas: number[];
  novasImagens: File[];
};

type PopFormProps = {
  initialValues?: Pop;
  categoriaFixa: string | null;
  categoriasDisponiveis: { id: number; nome: string }[];
  tagsDisponiveis: { id: number; nome: string }[];
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
};

function passosIniciais(pop?: Pop): PassoState[] {
  if (pop && pop.passos.length > 0) {
    return pop.passos.map((passo) => ({
      id: passo.id,
      descricao: passo.descricao,
      imagensExistentes: passo.imagens,
      imagensRemovidas: [],
      novasImagens: [],
    }));
  }
  return [{ descricao: "", imagensExistentes: [], imagensRemovidas: [], novasImagens: [] }];
}

export default function PopForm({
  initialValues,
  categoriaFixa,
  categoriasDisponiveis,
  tagsDisponiveis,
  submitLabel,
  onSubmit,
}: PopFormProps) {
  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [categoria, setCategoria] = useState(categoriaFixa ?? initialValues?.categoria ?? "");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(initialValues?.tags ?? []);
  const [novaTag, setNovaTag] = useState("");
  const [videoUrl, setVideoUrl] = useState(initialValues?.videoUrl ?? "");
  const [passos, setPassos] = useState<PassoState[]>(passosIniciais(initialValues));
  const [enviando, setEnviando] = useState(false);

  function atualizarPasso(index: number, alteracoes: Partial<PassoState>) {
    setPassos((atual) => atual.map((p, i) => (i === index ? { ...p, ...alteracoes } : p)));
  }

  function addPasso() {
    setPassos((atual) => [
      ...atual,
      { descricao: "", imagensExistentes: [], imagensRemovidas: [], novasImagens: [] },
    ]);
  }

  function removePasso(index: number) {
    setPassos((atual) => atual.filter((_, i) => i !== index));
  }

  function adicionarImagens(index: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    atualizarPasso(index, {
      novasImagens: [...passos[index].novasImagens, ...Array.from(files)],
    });
  }

  function removerImagemExistente(index: number, imagemId: number) {
    atualizarPasso(index, {
      imagensRemovidas: [...passos[index].imagensRemovidas, imagemId],
    });
  }

  function removerImagemNova(index: number, arquivoIndex: number) {
    atualizarPasso(index, {
      novasImagens: passos[index].novasImagens.filter((_, i) => i !== arquivoIndex),
    });
  }

  function alternarTag(nome: string) {
    setTagsSelecionadas((atual) =>
      atual.includes(nome) ? atual.filter((t) => t !== nome) : [...atual, nome]
    );
  }

  function adicionarNovaTag() {
    const nome = novaTag.trim();
    if (!nome || tagsSelecionadas.includes(nome)) return;
    setTagsSelecionadas((atual) => [...atual, nome]);
    setNovaTag("");
  }

  const todasAsTags = Array.from(
    new Set([...tagsDisponiveis.map((t) => t.nome), ...tagsSelecionadas])
  ).sort((a, b) => a.localeCompare(b));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const passosValidos = passos
      .map((p) => ({ ...p, descricao: p.descricao.trim() }))
      .filter((p) => p.descricao);

    if (passosValidos.length === 0) return;

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("categoria", categoria);
    formData.append("tags", tagsSelecionadas.join(","));
    formData.append("videoUrl", videoUrl);
    formData.append(
      "passos",
      JSON.stringify(
        passosValidos.map((p) => ({
          id: p.id,
          descricao: p.descricao,
          manterImagens: p.imagensExistentes
            .filter((img) => !p.imagensRemovidas.includes(img.id))
            .map((img) => img.id),
        }))
      )
    );

    passosValidos.forEach((p, index) => {
      p.novasImagens.forEach((file) => {
        formData.append("imagens", file);
        formData.append("imagensPasso", String(index));
      });
    });

    setEnviando(true);
    try {
      await onSubmit(formData);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-text mb-1">
          Título
        </label>
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Como tirar papel preso da impressora"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-1">
          Categoria
        </label>
        {categoriaFixa ? (
          <>
            <Input value={categoria} disabled />
            <p className="mt-1 text-xs text-gray-dark">
              Fixada no setor do seu usuário.
            </p>
          </>
        ) : (
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            className="w-full rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categoriasDisponiveis.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {todasAsTags.map((nome) => {
            const selecionada = tagsSelecionadas.includes(nome);
            return (
              <button
                key={nome}
                type="button"
                onClick={() => alternarTag(nome)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selecionada
                    ? "bg-orange-base text-white"
                    : "bg-gray text-gray-dark border border-gray-base/30 hover:border-orange-base"
                }`}
              >
                {nome}
              </button>
            );
          })}
          {todasAsTags.length === 0 && (
            <p className="text-xs text-gray-dark">Nenhuma tag cadastrada ainda.</p>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            value={novaTag}
            onChange={(e) => setNovaTag(e.target.value)}
            placeholder="Nova tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarNovaTag();
              }
            }}
          />
          <button
            type="button"
            onClick={adicionarNovaTag}
            className="shrink-0 text-sm font-medium text-orange-base hover:underline"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-1">
          Link do vídeo (YouTube) — opcional
        </label>
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          type="url"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-2">
          Passo a passo
        </label>
        <div className="flex flex-col gap-4">
          {passos.map((passo, index) => (
            <div key={index} className="rounded-lg border border-gray-base/20 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-base/10 text-orange-base text-xs font-semibold">
                  {index + 1}
                </span>
                <Input
                  value={passo.descricao}
                  onChange={(e) => atualizarPasso(index, { descricao: e.target.value })}
                  placeholder={`Passo ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removePasso(index)}
                  disabled={passos.length === 1}
                  className="shrink-0 text-red-base text-sm px-2 py-1 hover:underline disabled:opacity-30 disabled:hover:no-underline"
                >
                  Remover
                </button>
              </div>

              <div className="mt-2 ml-10 flex flex-wrap items-center gap-2">
                {passo.imagensExistentes
                  .filter((img) => !passo.imagensRemovidas.includes(img.id))
                  .map((img) => (
                    <div key={img.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.legenda ?? ""}
                        className="h-16 w-16 rounded-md object-cover border border-gray-base/20"
                      />
                      <button
                        type="button"
                        onClick={() => removerImagemExistente(index, img.id)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-base text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                {passo.novasImagens.map((file, fileIndex) => (
                  <div key={fileIndex} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-16 w-16 rounded-md object-cover border border-orange-base/40"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagemNova(index, fileIndex)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-base text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-base/40 text-gray-dark text-xs text-center hover:border-orange-base hover:text-orange-base transition">
                  + Foto
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => adicionarImagens(index, e.target.files)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPasso}
          className="mt-2 text-sm font-medium text-orange-base hover:underline"
        >
          + Adicionar passo
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
