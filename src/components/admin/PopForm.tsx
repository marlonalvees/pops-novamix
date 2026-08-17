"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Pop } from "@/types/pop";

type PopFormValues = Omit<Pop, "slug">;

type PopFormProps = {
  initialValues?: PopFormValues;
  submitLabel: string;
  onSubmit: (values: PopFormValues) => void;
};

const emptyValues: PopFormValues = {
  titulo: "",
  categoria: "",
  tags: [],
  videoUrl: "",
  passos: [""],
};

export default function PopForm({
  initialValues = emptyValues,
  submitLabel,
  onSubmit,
}: PopFormProps) {
  const [titulo, setTitulo] = useState(initialValues.titulo);
  const [categoria, setCategoria] = useState(initialValues.categoria);
  const [tagsTexto, setTagsTexto] = useState(initialValues.tags.join(", "));
  const [videoUrl, setVideoUrl] = useState(initialValues.videoUrl);
  const [passos, setPassos] = useState<string[]>(
    initialValues.passos.length > 0 ? initialValues.passos : [""]
  );

  function handlePassoChange(index: number, value: string) {
    setPassos((atual) => atual.map((p, i) => (i === index ? value : p)));
  }

  function addPasso() {
    setPassos((atual) => [...atual, ""]);
  }

  function removePasso(index: number) {
    setPassos((atual) => atual.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      titulo,
      categoria,
      tags: tagsTexto
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      videoUrl,
      passos: passos.map((p) => p.trim()).filter(Boolean),
    });
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
        <Input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ex: Impressora"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-1">
          Tags (separadas por vírgula)
        </label>
        <Input
          value={tagsTexto}
          onChange={(e) => setTagsTexto(e.target.value)}
          placeholder="Ex: impressora, papel, atolado"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-text mb-1">
          Link do vídeo (YouTube)
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
        <div className="flex flex-col gap-2">
          {passos.map((passo, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-base/10 text-orange-base text-xs font-semibold">
                {index + 1}
              </span>
              <Input
                value={passo}
                onChange={(e) => handlePassoChange(index, e.target.value)}
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
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
