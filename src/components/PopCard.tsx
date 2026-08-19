import Link from "next/link";
import type { PopResumo } from "@/types/pop";

type PopCardProps = {
  pop: PopResumo;
};

export default function PopCard({ pop }: PopCardProps) {
  return (
    <Link
      href={`/pop/${pop.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-gray-base/30 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-semibold text-gray-text group-hover:text-orange-base transition-colors">
          {pop.titulo}
        </span>
        <span className="shrink-0 rounded-full bg-orange-base/10 text-orange-base text-xs font-medium px-2 py-1">
          {pop.categoria}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {pop.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray text-gray-dark text-xs px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
