import { notFound } from "next/navigation";
import { getPopBySlug } from "@/lib/mock-pops";

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
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text">
        Editar: {pop.titulo}
      </h1>
      <p className="text-sm text-gray-dark mt-1">
        O formulário de edição entra aqui no próximo passo.
      </p>
    </main>
  );
}
