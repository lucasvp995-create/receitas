// Vocabulário do livro: seções, países, dificuldades e o formato de uma receita.

export const SECOES = {
  salgado: { nome: "Salgado", frase: "Pratos, massas, sopas e petiscos", cor: "salgado" },
  doce: { nome: "Doce", frase: "Bolos, sobremesas e docinhos", cor: "doce" },
  bebidas: { nome: "Bebidas", frase: "Sucos, drinks, cafés e chás", cor: "bebidas" },
} as const;

export type Secao = keyof typeof SECOES;

export function eSecao(valor: string): valor is Secao {
  return valor in SECOES;
}

export const DIFICULDADES = {
  facil: "Fácil",
  media: "Média",
  dificil: "Difícil",
} as const;

export type Dificuldade = keyof typeof DIFICULDADES;

export const ORIGENS = {
  familia: "Receita da família",
  importada: "Importada",
  sugerida: "Sugerida pelo livro",
} as const;

export type Receita = {
  id: string;
  titulo: string;
  secao: Secao;
  pais: string;
  categoria: string | null;
  descricao: string | null;
  tempo_minutos: number | null;
  porcoes: number | null;
  dificuldade: Dificuldade | null;
  ingredientes: string[];
  passos: string[];
  dicas: string | null;
  foto_capa: string | null;
  fonte_url: string | null;
  origem: keyof typeof ORIGENS;
  autor_id: string;
  criado_em: string;
  autor?: { nome: string; avatar_url: string | null } | null;
};

export type ResumoReceita = Pick<
  Receita,
  "id" | "titulo" | "secao" | "pais" | "categoria" | "tempo_minutos" | "foto_capa"
>;

export const CATEGORIAS = [
  "Entrada",
  "Prato principal",
  "Acompanhamento",
  "Massa",
  "Sopa",
  "Salada",
  "Lanche",
  "Pão",
  "Bolo",
  "Torta",
  "Sobremesa",
  "Docinho",
  "Biscoito",
  "Suco",
  "Drink",
  "Café e chá",
];

const BANDEIRAS: Record<string, string> = {
  Brasil: "🇧🇷", Portugal: "🇵🇹", Itália: "🇮🇹", França: "🇫🇷", Espanha: "🇪🇸",
  México: "🇲🇽", Peru: "🇵🇪", Argentina: "🇦🇷", Uruguai: "🇺🇾", Chile: "🇨🇱",
  Colômbia: "🇨🇴", Venezuela: "🇻🇪", Cuba: "🇨🇺", "Estados Unidos": "🇺🇸",
  "Reino Unido": "🇬🇧", Irlanda: "🇮🇪", Alemanha: "🇩🇪", Áustria: "🇦🇹", Suíça: "🇨🇭",
  Bélgica: "🇧🇪", Holanda: "🇳🇱", Suécia: "🇸🇪", Polônia: "🇵🇱", Hungria: "🇭🇺",
  Grécia: "🇬🇷", Turquia: "🇹🇷", Rússia: "🇷🇺", Líbano: "🇱🇧", Israel: "🇮🇱",
  Marrocos: "🇲🇦", Egito: "🇪🇬", Angola: "🇦🇴", Moçambique: "🇲🇿", "Cabo Verde": "🇨🇻",
  Índia: "🇮🇳", China: "🇨🇳", Japão: "🇯🇵", "Coreia do Sul": "🇰🇷", Tailândia: "🇹🇭",
  Vietnã: "🇻🇳", Indonésia: "🇮🇩", Filipinas: "🇵🇭",
};

export const PAISES = Object.keys(BANDEIRAS).sort((a, b) => a.localeCompare(b, "pt-BR"));

export function bandeira(pais: string) {
  return BANDEIRAS[pais] ?? "🌍";
}

export function formatarTempo(minutos: number | null) {
  if (!minutos) return null;
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

// Uma linha de ingrediente terminada em ":" é um subtítulo, como "Para o molho:".
export function eSubtitulo(linha: string) {
  return linha.trim().endsWith(":");
}

export function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
