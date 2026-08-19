import Link from "next/link";
import { notFound } from "next/navigation";
import { getPopBySlug } from "@/lib/mock-pops";
import EditPopClient from "@/components/admin/EditPopClient";

type EditPopPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditPopPage({ params }: EditPopPageProps) {
  const { slug } = await params;
  const pop = getPopBySlug(slug);

  if (!pop) {
    notFound();
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
      <Link
        href="https://hub.lojanovamix.com.br"
        className="text-sm text-gray-dark hover:text-orange-base transition-colors"
      >
        ← Voltar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-text mb-6">
        Editar: {pop.titulo}
      </h1>

      <EditPopClient pop={pop} />
    </main>
  );
}
