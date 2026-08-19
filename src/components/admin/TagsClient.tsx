"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Tag = { id: number; nome: string };

type TagsClientProps = {
  tagsIniciais: Tag[];
};

export default function TagsClient({ tagsIniciais }: TagsClientProps) {
  const router = useRouter();
  const [tags, setTags] = useState(tagsIniciais);
  const [busca, setBusca] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const tagsFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return tags;
    return tags.filter((t) => t.nome.toLowerCase().includes(termo));
  }, [tags, busca]);

  async function criar(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    if (!novoNome.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao criar tag.");
        return;
      }
      setTags((atual) => [...atual, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNovoNome("");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(tag: Tag) {
    setEditandoId(tag.id);
    setNomeEditado(tag.nome);
    setErro(null);
  }

  async function salvarEdicao(id: number) {
    if (!nomeEditado.trim()) return;
    setErro(null);

    const res = await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeEditado.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error ?? "Erro ao editar tag.");
      return;
    }
    setTags((atual) => atual.map((t) => (t.id === id ? data : t)));
    setEditandoId(null);
    router.refresh();
  }

  async function excluir(tag: Tag) {
    if (!confirm(`Excluir a tag "${tag.nome}"? Ela será removida de todos os POPs.`)) return;

    const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      alert(data?.error ?? "Erro ao excluir tag.");
      return;
    }
    setTags((atual) => atual.filter((t) => t.id !== tag.id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={criar} className="flex gap-2">
        <Input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome da tag"
        />
        <Button type="submit" disabled={enviando}>
          Adicionar
        </Button>
      </form>

      {erro && <p className="text-sm text-red-base">{erro}</p>}

      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar tag..."
      />

      <ul className="flex flex-wrap gap-2">
        {tagsFiltradas.map((tag) => (
          <li
            key={tag.id}
            className="flex items-center gap-2 rounded-full border border-gray-base/20 bg-white pl-3 pr-2 py-1"
          >
            {editandoId === tag.id ? (
              <>
                <Input
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="h-7 w-32"
                />
                <button
                  type="button"
                  onClick={() => salvarEdicao(tag.id)}
                  className="text-xs font-medium text-orange-base hover:underline"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoId(null)}
                  className="text-xs font-medium text-gray-dark hover:underline"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-text">{tag.nome}</span>
                <button
                  type="button"
                  onClick={() => iniciarEdicao(tag)}
                  className="text-xs font-medium text-gray-dark hover:text-orange-base transition"
                >
                  Renomear
                </button>
                <button
                  type="button"
                  onClick={() => excluir(tag)}
                  className="text-xs font-medium text-red-base hover:underline"
                >
                  ×
                </button>
              </>
            )}
          </li>
        ))}
        {tagsFiltradas.length === 0 && (
          <p className="text-sm text-gray-dark">
            {busca ? `Nenhuma tag encontrada para "${busca}".` : "Nenhuma tag cadastrada ainda."}
          </p>
        )}
      </ul>
    </div>
  );
}
