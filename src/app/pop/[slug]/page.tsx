import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthPayload, isPopsAdmin } from "@/lib/auth";
import { getPopBySlug } from "@/lib/pops-repository";
import { getVideoEmbedUrl } from "@/lib/video";
import { PassoAPasso } from "@/components/pop/PassoAPasso";

type PopPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PopPage({ params }: PopPageProps) {
  const { slug } = await params;
  const payload = await getAuthPayload();
  const pop = await getPopBySlug(slug, {
    isAdmin: isPopsAdmin(payload),
    viewerSector: payload?.sector?.name ?? null,
  });

  if (!pop) {
    notFound();
  }

  const embedUrl = pop.videoUrl ? getVideoEmbedUrl(pop.videoUrl) : null;

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

      <PassoAPasso passos={pop.passos} />
    </main>
  );
}
