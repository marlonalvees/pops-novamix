import Link from "next/link";
import { mockPops } from "@/lib/mock-pops";

export default function AdminPage() {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-text">
            Painel administrativo
          </h1>
          <p className="text-sm text-gray-dark mt-1">
            {mockPops.length} procedimento(s) cadastrado(s).
          </p>
        </div>

        <Link
          href="/admin/pops/novo"
          className="rounded-md bg-orange-base px-4 py-2 text-sm font-medium text-white hover:bg-orange-light transition"
        >
          + Novo POP
        </Link>
      </div>

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
            {mockPops.map((pop) => (
              <tr
                key={pop.slug}
                className="border-b border-gray-base/10 last:border-0"
              >
                <td className="px-4 py-3 text-gray-text">{pop.titulo}</td>
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
                    <button
                      type="button"
                      className="rounded-md px-3 py-1.5 text-xs font-medium border border-red-base/30 text-red-base hover:bg-red-base hover:text-white transition"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
