"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Categoria = { id: number; nome: string; slug: string };

type CategoriasClientProps = {
  categoriasIniciais: Categoria[];
};

export default function CategoriasClient({ categoriasIniciais }: CategoriasClientProps) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [novoNome, setNovoNome] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function criar(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    if (!novoNome.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao criar categoria.");
        return;
      }
      setCategorias((atual) => [...atual, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNovoNome("");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(categoria: Categoria) {
    setEditandoId(categoria.id);
    setNomeEditado(categoria.nome);
    setErro(null);
  }

  async function salvarEdicao(id: number) {
    if (!nomeEditado.trim()) return;
    setErro(null);

    const res = await fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeEditado.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error ?? "Erro ao editar categoria.");
      return;
    }
    setCategorias((atual) => atual.map((c) => (c.id === id ? data : c)));
    setEditandoId(null);
    router.refresh();
  }

  async function excluir(categoria: Categoria) {
    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) return;

    const res = await fetch(`/api/categorias/${categoria.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      alert(data?.error ?? "Erro ao excluir categoria.");
      return;
    }
    setCategorias((atual) => atual.filter((c) => c.id !== categoria.id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={criar} className="flex gap-2">
        <Input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome da categoria (igual ao setor no hub)"
        />
        <Button type="submit" disabled={enviando}>
          Adicionar
        </Button>
      </form>

      {erro && <p className="text-sm text-red-base">{erro}</p>}

      <ul className="flex flex-col gap-2">
        {categorias.map((categoria) => (
          <li
            key={categoria.id}
            className="flex items-center gap-2 rounded-lg border border-gray-base/20 bg-white px-4 py-2"
          >
            {editandoId === categoria.id ? (
              <>
                <Input
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={() => salvarEdicao(categoria.id)}>
                  Salvar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditandoId(null)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-text">{categoria.nome}</span>
                <button
                  type="button"
                  onClick={() => iniciarEdicao(categoria)}
                  className="text-xs font-medium text-gray-dark hover:text-orange-base transition"
                >
                  Renomear
                </button>
                <button
                  type="button"
                  onClick={() => excluir(categoria)}
                  className="text-xs font-medium text-red-base hover:underline"
                >
                  Excluir
                </button>
              </>
            )}
          </li>
        ))}
        {categorias.length === 0 && (
          <p className="text-sm text-gray-dark">Nenhuma categoria cadastrada ainda.</p>
        )}
      </ul>
    </div>
  );
}
