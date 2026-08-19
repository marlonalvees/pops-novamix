export type PopImagem = {
  id: number;
  nomeArquivo: string;
  legenda: string | null;
  url: string;
};

export type PopPasso = {
  id?: number;
  descricao: string;
  imagens: PopImagem[];
};

export type Pop = {
  slug: string;
  titulo: string;
  categoria: string;
  tags: string[];
  videoUrl: string;
  passos: PopPasso[];
};

export type PopResumo = {
  slug: string;
  titulo: string;
  categoria: string;
  tags: string[];
};
