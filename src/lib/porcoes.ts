// Multiplica as quantidades de uma linha de ingrediente: "1 ½ xícara" × 2 = "3 xícaras".
// Temperaturas, porcentagens e medidas de forma ("forma de 20 cm") não mudam.

const FRACOES: Record<string, number> = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4, "⅛": 1 / 8,
};
const GLIFOS: [number, string][] = [
  [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [1 / 2, "½"], [2 / 3, "⅔"], [3 / 4, "¾"],
];

// Inteiro opcional + fração ("1 1/2", "1 e 1/2", "1½", "½") ou número com decimais ("1,5").
const NUMERO =
  /(?:(\d+)\s*(?:e\s+)?)?(?:(\d+)\/(\d+)|([½⅓⅔¼¾⅛]))|\d+(?:[.,]\d+)?/g;
const NAO_ESCALA = /^\s*(?:°|º|%|graus|cm\b|mm\b|x\s*\d)/i;

function valor(trecho: RegExpExecArray): number {
  const [texto, inteiro, numerador, denominador, glifo] = trecho;
  if (numerador || glifo) {
    const fracao = glifo ? FRACOES[glifo] : Number(numerador) / Number(denominador);
    return (inteiro ? Number(inteiro) : 0) + fracao;
  }
  return Number(texto.replace(",", "."));
}

export function formatarQuantidade(numero: number): string {
  if (numero >= 100) return String(Math.round(numero / 5) * 5);
  if (numero >= 10) return String(Math.round(numero));
  const inteiro = Math.floor(numero);
  const resto = numero - inteiro;
  if (resto < 0.06) return inteiro ? String(inteiro) : numero.toFixed(2).replace(".", ",");
  if (resto > 0.94) return String(inteiro + 1);
  const glifo = GLIFOS.find(([fracao]) => Math.abs(resto - fracao) < 0.05);
  if (glifo) return inteiro ? `${inteiro} ${glifo[1]}` : glifo[1];
  return numero.toFixed(1).replace(".", ",");
}

export type Pedaco = { texto: string; mudou: boolean };

export function escalarLinha(linha: string, fator: number): Pedaco[] {
  if (fator === 1) return [{ texto: linha, mudou: false }];
  const pedacos: Pedaco[] = [];
  let ultimo = 0;
  for (const trecho of linha.matchAll(NUMERO)) {
    const inicio = trecho.index;
    const fim = inicio + trecho[0].length;
    if (NAO_ESCALA.test(linha.slice(fim))) continue;
    if (inicio > ultimo) pedacos.push({ texto: linha.slice(ultimo, inicio), mudou: false });
    pedacos.push({ texto: formatarQuantidade(valor(trecho) * fator), mudou: true });
    ultimo = fim;
  }
  if (ultimo < linha.length) pedacos.push({ texto: linha.slice(ultimo), mudou: false });
  return pedacos;
}
