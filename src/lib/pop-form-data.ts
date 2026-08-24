import { TAMANHO_MAXIMO_IMAGEM, TIPOS_IMAGEM_PERMITIDOS } from "@/lib/storage";

export type PopInputPasso = {
  id?: number;
  descricao: string;
  informacoesExtras?: string;
  manterImagens?: number[];
};

export type PopInput = {
  titulo: string;
  categoria: string;
  privado: boolean;
  tags: string[];
  videoUrl: string;
  passos: PopInputPasso[];
};

export type ArquivoPasso = {
  passoIndex: number;
  file: File;
};

export async function parsePopFormData(
  formData: FormData
): Promise<{ dados: PopInput; arquivos: ArquivoPasso[] }> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const privado = String(formData.get("privado") ?? "") === "true";
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  let passosBrutos: PopInputPasso[];
  try {
    passosBrutos = JSON.parse(String(formData.get("passos") ?? "[]"));
  } catch {
    throw new Error("Formato inválido para os passos.");
  }

  if (!titulo) throw new Error("Título é obrigatório.");
  if (!categoria) throw new Error("Categoria é obrigatória.");

  const passos = passosBrutos
    .map((passo) => ({
      ...passo,
      descricao: passo.descricao?.trim() ?? "",
      informacoesExtras: passo.informacoesExtras?.trim() || undefined,
    }))
    .filter((passo) => passo.descricao);

  if (passos.length === 0) throw new Error("Informe ao menos um passo.");

  const arquivosBrutos = formData
    .getAll("imagens")
    .filter((valor): valor is File => valor instanceof File && valor.size > 0);
  const indicesPasso = formData.getAll("imagensPasso").map((valor) => Number(valor));

  const arquivos: ArquivoPasso[] = arquivosBrutos.map((file, indice) => {
    if (!TIPOS_IMAGEM_PERMITIDOS.has(file.type)) {
      throw new Error(`Tipo de imagem não suportado: ${file.name}`);
    }
    if (file.size > TAMANHO_MAXIMO_IMAGEM) {
      throw new Error(`Imagem muito grande (máx. 15MB): ${file.name}`);
    }

    return { passoIndex: indicesPasso[indice] ?? 0, file };
  });

  return { dados: { titulo, categoria, privado, tags, videoUrl, passos }, arquivos };
}
