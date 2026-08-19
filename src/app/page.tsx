import HomeClient from "@/components/HomeClient";
import { listCategorias, listPops } from "@/lib/pops-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pops, categorias] = await Promise.all([listPops(), listCategorias()]);

  return <HomeClient pops={pops} categorias={categorias.map((c) => c.nome)} />;
}
