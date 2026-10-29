"use client";

import { useState } from "react";
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
}: {
  ingredientes: string[];
  secao: keyof typeof COR;
  porcoes: number | null;
}) {
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
        <div className="flex items-center gap-2" role="group" aria-label="Ajustar porções">
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

      {fator !== 1 && (
        <p className="mt-4 text-sm text-tinta-suave">
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
