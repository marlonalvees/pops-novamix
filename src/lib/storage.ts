import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const IMAGENS_ROOT = path.join(process.cwd(), "src", "imagens");

const EXTENSOES_POR_TIPO: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const TIPOS_IMAGEM_PERMITIDOS = new Set(Object.keys(EXTENSOES_POR_TIPO));
export const TAMANHO_MAXIMO_IMAGEM = 15 * 1024 * 1024;

function pastaDoPop(popSlug: string) {
  return path.join(IMAGENS_ROOT, popSlug);
}

export async function salvarImagem(popSlug: string, file: File): Promise<string> {
  const dir = pastaDoPop(popSlug);
  await mkdir(dir, { recursive: true });

  const extensao = EXTENSOES_POR_TIPO[file.type] ?? "";
  const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(dir, nomeArquivo), bytes);

  return nomeArquivo;
}

export async function lerImagem(popSlug: string, nomeArquivo: string): Promise<Buffer> {
  return readFile(path.join(pastaDoPop(popSlug), nomeArquivo));
}

export async function removerImagem(popSlug: string, nomeArquivo: string): Promise<void> {
  await rm(path.join(pastaDoPop(popSlug), nomeArquivo), { force: true });
}

export async function removerPastaPop(popSlug: string): Promise<void> {
  await rm(pastaDoPop(popSlug), { recursive: true, force: true });
}
