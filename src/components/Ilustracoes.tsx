// Avatares ilustrados, nas cores do livro. Guardados no perfil como "ilustracao:<nome>".

const C = { papel: "#fbf6ec", tinta: "#3b3e54", dourado: "#d7a852", salgado: "#cc6455", doce: "#974b5b", bebidas: "#4d8278" };

export const ILUSTRACOES = {
  tomate: {
    nome: "Tomate",
    fundo: C.dourado,
    desenho: (
      <>
        <circle cx="32" cy="36" r="16" fill={C.salgado} />
        <path d="M24 22c4 2 6 2 8 0 2 2 4 2 8 0-2 4-5 5-8 4-3 1-6 0-8-4z" fill={C.bebidas} />
        <path d="M32 22v-5" stroke={C.bebidas} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="25" cy="32" rx="3" ry="5" fill={C.papel} opacity=".5" />
      </>
    ),
  },
  alho: {
    nome: "Alho",
    fundo: C.doce,
    desenho: (
      <>
        <path d="M32 14c-3 6-14 10-14 22 0 9 6 14 14 14s14-5 14-14c0-12-11-16-14-22z" fill={C.papel} />
        <path d="M32 18c-2 8-5 14-5 22M32 18c2 8 5 14 5 22M32 20v29" stroke={C.dourado} strokeWidth="1.6" fill="none" />
        <path d="M27 50h10" stroke={C.tinta} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  limao: {
    nome: "Limão",
    fundo: C.tinta,
    desenho: (
      <>
        <circle cx="32" cy="34" r="16" fill={C.dourado} />
        <circle cx="32" cy="34" r="12" fill={C.papel} />
        <circle cx="32" cy="34" r="10" fill="#f2d48c" />
        {[0, 60, 120, 180, 240, 300].map((angulo) => (
          <path key={angulo} d="M32 34V24" stroke={C.papel} strokeWidth="2" transform={`rotate(${angulo} 32 34)`} />
        ))}
        <circle cx="32" cy="34" r="2" fill={C.papel} />
      </>
    ),
  },
  queijo: {
    nome: "Queijo",
    fundo: C.bebidas,
    desenho: (
      <>
        <path d="M14 42 46 24l4 18z" fill={C.dourado} />
        <path d="M14 42h36v6H14z" fill="#c4943f" />
        <circle cx="30" cy="38" r="3" fill="#c4943f" />
        <circle cx="41" cy="33" r="2" fill="#c4943f" />
        <circle cx="42" cy="45" r="1.6" fill={C.dourado} />
      </>
    ),
  },
  macarrao: {
    nome: "Macarrão",
    fundo: C.salgado,
    desenho: (
      <>
        <path d="M14 34h36a18 14 0 0 1-36 0z" fill={C.papel} />
        <path d="M20 34c2-8 6-4 8-10s6 2 8-4 6 4 8 0M22 34c2-5 5-1 7-6s6 1 8-3 5 3 7 1" stroke={C.dourado} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M38 12 34 30" stroke={C.tinta} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M43 13 38 30" stroke={C.tinta} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  cafe: {
    nome: "Café",
    fundo: C.dourado,
    desenho: (
      <>
        <path d="M18 28h24v10a12 12 0 0 1-24 0z" fill={C.tinta} />
        <path d="M42 31h3a5 5 0 0 1 0 10h-3" stroke={C.tinta} strokeWidth="3" fill="none" />
        <ellipse cx="30" cy="28" rx="12" ry="3" fill="#6b4a3a" />
        <path d="M25 22c-2-3 2-4 0-8M31 22c-2-3 2-4 0-8M37 22c-2-3 2-4 0-8" stroke={C.papel} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M14 51h32" stroke={C.papel} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  bolo: {
    nome: "Bolo",
    fundo: C.bebidas,
    desenho: (
      <>
        <path d="M16 34h32v14H16z" fill={C.papel} />
        <path d="M16 34h32v5c-3 3-5-1-8 2s-5-1-8 2-5-1-8 2-5-1-8 0z" fill={C.doce} />
        <path d="M16 42h32" stroke={C.dourado} strokeWidth="2" />
        <path d="M32 33v-9" stroke={C.dourado} strokeWidth="3" strokeLinecap="round" />
        <path d="M32 21c-3-3 0-6 0-8 2 3 3 5 0 8z" fill={C.salgado} />
      </>
    ),
  },
  pimenta: {
    nome: "Pimenta",
    fundo: C.papel,
    desenho: (
      <>
        <path d="M22 22c-4 14 4 28 22 30-8-6-10-16-12-28z" fill={C.salgado} />
        <path d="M22 22c2-3 7-4 10 2" stroke={C.bebidas} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M26 21c0-4 2-7 5-8" stroke={C.bebidas} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M27 30c0 6 2 12 6 16" stroke={C.papel} strokeWidth="2" fill="none" opacity=".6" strokeLinecap="round" />
      </>
    ),
  },
} as const;

export type NomeIlustracao = keyof typeof ILUSTRACOES;

export function eIlustracao(valor: string): valor is NomeIlustracao {
  return valor in ILUSTRACOES;
}

export function Ilustracao({ nome, tamanho }: { nome: NomeIlustracao; tamanho: number }) {
  const { fundo, desenho } = ILUSTRACOES[nome];
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} className="shrink-0 rounded-full" aria-hidden>
      <circle cx="32" cy="32" r="32" fill={fundo} />
      {desenho}
    </svg>
  );
}
