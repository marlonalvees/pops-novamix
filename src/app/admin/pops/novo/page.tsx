import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import NovoPopClient from "@/components/admin/NovoPopClient";

export default async function NovoPopPage() {
  const payload = await getAuthPayload();
  const isGlobalAdmin = payload?.role === "admin";
  const categoriaFixa = isGlobalAdmin ? null : payload?.sector?.name ?? null;

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
      <Link
        href="https://hub.lojanovamix.com.br"
        className="text-sm text-gray-dark hover:text-orange-base transition-colors"
      >
        ← Voltar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-text mb-6">
        Novo POP
      </h1>

      <NovoPopClient categoriaFixa={categoriaFixa} />
    </main>
  );
}
