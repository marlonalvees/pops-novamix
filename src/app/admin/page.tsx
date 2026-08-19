import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import { listPops } from "@/lib/pops-repository";
import AdminPopsList from "@/components/admin/AdminPopsList";

export default async function AdminPage() {
  const payload = await getAuthPayload();
  const isGlobalAdmin = payload?.role === "admin";
  const categoria = isGlobalAdmin ? undefined : payload?.sector?.name;

  const pops = await listPops({ categoria, includeInactive: true });

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
      <Link
        href="https://hub.lojanovamix.com.br"
        className="text-sm text-gray-dark hover:text-orange-base transition-colors"
      >
        ← Voltar
      </Link>

      <div className="mt-4 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-text">
            Painel administrativo
          </h1>
          <p className="text-sm text-gray-dark mt-1">
            {pops.length} procedimento(s) cadastrado(s)
            {categoria ? ` no setor ${categoria}` : ""}.
          </p>
        </div>

        <Link
          href="/admin/pops/novo"
          className="rounded-md bg-orange-base px-4 py-2 text-sm font-medium text-white hover:bg-orange-light transition"
        >
          + Novo POP
        </Link>
      </div>

      <AdminPopsList pops={pops} />
    </main>
  );
}
