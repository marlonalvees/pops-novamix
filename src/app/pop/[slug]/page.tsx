import Link from "next/link";
import { notFound } from "next/navigation";
import { getPopBySlug } from "@/lib/mock-pops";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type PopPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PopPage({ params }: PopPageProps) {
  const { slug } = await params;
  const pop = getPopBySlug(slug);

  if (!pop) {
    notFound();
  }

  const embedUrl = getYoutubeEmbedUrl(pop.videoUrl);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-sm text-gray-dark hover:text-orange-base transition-colors"
      >
        ← Voltar
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-text">
          {pop.titulo}
        </h1>
        <span className="shrink-0 rounded-full bg-orange-base/10 text-orange-base text-xs font-medium px-2 py-1">
          {pop.categoria}
        </span>
      </div>

      {embedUrl ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-gray-base/20 bg-black">
          <iframe
            src={embedUrl}
            title={pop.titulo}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-dark">
          Vídeo indisponível para este procedimento.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-text mb-3">
          Passo a passo
        </h2>
        <ol className="flex flex-col gap-3">
          {pop.passos.map((passo, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-base text-white text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-sm text-gray-text pt-0.5">{passo}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
