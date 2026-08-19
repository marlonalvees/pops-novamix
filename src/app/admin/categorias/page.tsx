import { getAuthPayload } from "@/lib/auth";
import { listCategorias } from "@/lib/pops-repository";
import CategoriasClient from "@/components/admin/CategoriasClient";

export default async function CategoriasPage() {
  const payload = await getAuthPayload();

  if (payload?.role !== "admin") {
    return (
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-gray-dark">
          Apenas administradores do Hub Novamix podem gerenciar categorias.
        </p>
      </main>
    );
  }

  const categorias = await listCategorias();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text mb-6">Categorias</h1>
      <CategoriasClient categoriasIniciais={categorias} />
    </main>
  );
}
