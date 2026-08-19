import { NextResponse } from "next/server";
import path from "path";
import { IMAGENS_ROOT } from "@/lib/storage";
import { readFile } from "fs/promises";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { path: segmentos } = await params;
  const resolvido = path.join(IMAGENS_ROOT, ...segmentos);

  // Impede path traversal (ex: ../../.env) para fora da pasta de imagens.
  if (!resolvido.startsWith(IMAGENS_ROOT + path.sep)) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }

  const extensao = path.extname(resolvido).toLowerCase();
  const contentType = CONTENT_TYPES[extensao];
  if (!contentType) {
    return NextResponse.json({ error: "Tipo de arquivo não suportado." }, { status: 400 });
  }

  try {
    const arquivo = await readFile(resolvido);
    return new NextResponse(new Uint8Array(arquivo), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }
}
