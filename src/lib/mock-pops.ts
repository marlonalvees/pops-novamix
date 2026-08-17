import type { Pop } from "@/types/pop";

export function getPopBySlug(slug: string): Pop | undefined {
  return mockPops.find((pop) => pop.slug === slug);
}

export const mockPops: Pop[] = [
  {
    slug: "papel-preso-impressora",
    titulo: "Como tirar papel preso da impressora",
    categoria: "Impressora",
    tags: ["impressora", "papel", "atolado", "travado"],
    videoUrl: "https://www.youtube.com/watch?v=exemplo1",
    passos: [
      "Desligue a impressora antes de mexer no papel.",
      "Abra a tampa traseira com cuidado.",
      "Puxe o papel preso na direção da saída, sem forçar.",
      "Feche a tampa e ligue a impressora novamente.",
    ],
  },
  {
    slug: "como-imprimir",
    titulo: "Como imprimir um documento",
    categoria: "Impressora",
    tags: ["impressora", "imprimir", "documento"],
    videoUrl: "https://www.youtube.com/watch?v=exemplo2",
    passos: [
      "Abra o documento que deseja imprimir.",
      "Pressione Ctrl+P.",
      "Selecione a impressora correta.",
      "Clique em Imprimir.",
    ],
  },
  {
    slug: "emitir-nota-fiscal-shopee",
    titulo: "Como emitir e enviar nota fiscal pela Shopee",
    categoria: "Fiscal",
    tags: ["shopee", "nota fiscal", "nfe", "ecommerce"],
    videoUrl: "https://www.youtube.com/watch?v=exemplo3",
    passos: [
      "Acesse o painel de vendedor da Shopee.",
      "Vá até o pedido correspondente.",
      "Emita a nota fiscal pelo sistema integrado.",
      "Envie a nota anexando ao pedido na plataforma.",
    ],
  },
  {
    slug: "imprimir-notas-em-massa",
    titulo: "Como imprimir notas fiscais em massa",
    categoria: "Fiscal",
    tags: ["nota fiscal", "impressao em massa", "lote"],
    videoUrl: "https://www.youtube.com/watch?v=exemplo4",
    passos: [
      "Acesse o sistema de emissão de notas.",
      "Selecione o período ou os pedidos desejados.",
      "Escolha a opção de impressão em lote.",
      "Confirme e aguarde a geração do PDF com todas as notas.",
    ],
  },
];
