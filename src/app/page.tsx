import HomeClient from "@/components/HomeClient";
import { getAuthPayload, isPopsAdmin } from "@/lib/auth";
import { listCategorias, listPops } from "@/lib/pops-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const payload = await getAuthPayload();
  const [pops, categorias] = await Promise.all([
    listPops({
      isAdmin: isPopsAdmin(payload),
      viewerSector: payload?.sector?.name ?? null,
    }),
    listCategorias(),
  ]);

  return <HomeClient pops={pops} categorias={categorias.map((c) => c.nome)} />;
}
