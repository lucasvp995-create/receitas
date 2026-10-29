"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { porNaLista } from "@/lib/acoes";
import { eSubtitulo } from "@/lib/livro";
import { escalarLinha, formatarQuantidade } from "@/lib/porcoes";

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };
// Sem o número de porções, ajustamos a receita inteira: metade, o dobro…
const MULTIPLOS = [0.5, 1, 1.5, 2, 3, 4];

// Ingredientes em colunas separadas por fios duplos, com as quantidades ajustáveis
// ao número de pessoas. Toque num item para riscá-lo enquanto cozinha.
export function ListaIngredientes({
  ingredientes,
  secao,
  porcoes,
  receitaId,
  titulo,
}: {
  ingredientes: string[];
  secao: keyof typeof COR;
  porcoes: number | null;
  receitaId: string;
  titulo: string;
}) {
  const [naLista, setNaLista] = useState(false);
  const [pondo, iniciar] = useTransition();
  const [riscados, setRiscados] = useState<Set<number>>(new Set());
  const [pessoas, setPessoas] = useState(porcoes ?? 1);
  const [multiplo, setMultiplo] = useState(1);
  const fator = porcoes ? pessoas / porcoes : MULTIPLOS[multiplo];
  const colunas = ingredientes.length > 10 ? "sm:columns-3" : ingredientes.length > 4 ? "sm:columns-2" : "";

  function alternar(indice: number) {
    setRiscados((atual) => {
      const novo = new Set(atual);
      if (novo.has(indice)) novo.delete(indice);
      else novo.add(indice);
      return novo;
    });
  }

  const rotulo = porcoes
    ? `${pessoas} ${pessoas === 1 ? "porção" : "porções"}`
    : fator === 1 ? "Receita inteira" : fator === 0.5 ? "Meia receita" : `${formatarQuantidade(fator)}× a receita`;
  const podeMenos = porcoes ? pessoas > 1 : multiplo > 0;
  const podeMais = porcoes ? pessoas < 99 : multiplo < MULTIPLOS.length - 1;
  const passo = (delta: number) =>
    porcoes ? setPessoas((atual) => atual + delta) : setMultiplo((atual) => atual + delta);
  const botao = `grid size-8 place-items-center rounded-full border border-borda text-lg leading-none hover:bg-papel-escuro disabled:opacity-30`;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className={`caixa text-xs ${COR[secao]}`}>Ingredientes</h2>
        <div className="flex items-center gap-2 print:hidden" role="group" aria-label="Ajustar porções">
          <button type="button" onClick={() => passo(-1)} disabled={!podeMenos} className={botao} aria-label="Menos">−</button>
          <span className="caixa min-w-28 text-center text-xs" aria-live="polite">{rotulo}</span>
          <button type="button" onClick={() => passo(1)} disabled={!podeMais} className={botao} aria-label="Mais">+</button>
        </div>
      </div>

      <ul
        className={`gap-12 ${colunas}`}
        style={{ columnRule: `3px double var(--color-${secao})` }}
      >
        {ingredientes.map((linha, indice) =>
          eSubtitulo(linha) ? (
            <li key={indice} className={`caixa break-after-avoid pt-3 pb-1 text-xs first:pt-0 ${COR[secao]}`}>
              {linha.replace(/:\s*$/, "")}
            </li>
          ) : (
            <li key={indice} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => alternar(indice)}
                aria-pressed={riscados.has(indice)}
                className={`w-full py-1 text-left leading-snug font-semibold transition ${
                  riscados.has(indice) ? "text-tinta-suave/60 line-through" : ""
                }`}
              >
                {escalarLinha(linha, fator).map((pedaco, posicao) =>
                  pedaco.mudou ? (
                    <span key={posicao} className={COR[secao]}>{pedaco.texto}</span>
                  ) : (
                    pedaco.texto
                  ),
                )}
              </button>
            </li>
          ),
        )}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
        {naLista ? (
          <p className="text-sm">
            Ingredientes na sua lista de compras.{" "}
            <Link href="/compras" className="font-semibold underline">Ver lista →</Link>
          </p>
        ) : (
          <button
            type="button"
            disabled={pondo}
            onClick={() =>
              iniciar(async () => {
                const linhas = ingredientes
                  .filter((linha) => !eSubtitulo(linha))
                  .map((linha) => escalarLinha(linha, fator).map((pedaco) => pedaco.texto).join(""));
                const rotuloTitulo = fator === 1 ? titulo : `${titulo} (${rotulo.toLowerCase()})`;
                await porNaLista(receitaId, rotuloTitulo, linhas);
                setNaLista(true);
              })
            }
            className="caixa flex items-center gap-2 rounded-full border border-borda px-4 py-2 text-xs text-tinta-suave hover:border-tinta-suave hover:text-tinta disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 4h2l2.4 11h11l2-8H6.2" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="9" cy="19.5" r="1.5" />
              <circle cx="17" cy="19.5" r="1.5" />
            </svg>
            {pondo ? "Pondo na lista…" : "Pôr na lista de compras"}
          </button>
        )}
      </div>

      {fator !== 1 && (
        <p className="mt-4 text-sm text-tinta-suave print:hidden">
          <span className={COR[secao]}>Quantidades recalculadas.</span> O modo de preparo continua com as medidas
          originais.{" "}
          <button
            type="button"
            onClick={() => { setPessoas(porcoes ?? 1); setMultiplo(1); }}
            className="underline hover:text-tinta"
          >
            Voltar ao original
          </button>
        </p>
      )}
    </>
  );
}
