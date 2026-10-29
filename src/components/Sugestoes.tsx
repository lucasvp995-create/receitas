"use client";

import { useState, useTransition } from "react";
import { FormularioReceita } from "@/components/FormularioReceita";
import { pedirSugestoes } from "@/lib/acoes";
import { bandeira, DIFICULDADES, eSubtitulo, formatarTempo, SECOES, type Secao } from "@/lib/livro";
import type { Sugestao } from "@/lib/sugerir";

const IDEIAS = [
  "Um jantar rápido para o meio da semana",
  "Um almoço especial de domingo",
  "Uma sobremesa que dá para fazer na véspera",
  "Um drink diferente para o fim de semana",
  "Um prato de um país que ainda não temos no livro",
];

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };
const BORDA = { salgado: "border-t-salgado", doce: "border-t-doce", bebidas: "border-t-bebidas" };

export function Sugestoes({ membroId }: { membroId: string }) {
  const [pedido, setPedido] = useState("");
  const [secao, setSecao] = useState<Secao | "">("");
  const [sugestoes, setSugestoes] = useState<Sugestao[] | null>(null);
  const [aberta, setAberta] = useState<number | null>(null);
  const [escolhida, setEscolhida] = useState<Sugestao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pensando, iniciar] = useTransition();

  function sugerir(evento?: React.FormEvent) {
    evento?.preventDefault();
    setErro(null);
    iniciar(async () => {
      const resultado = await pedirSugestoes(pedido, secao);
      if ("erro" in resultado) setErro(resultado.erro);
      else {
        setSugestoes(resultado.sugestoes);
        setAberta(null);
      }
    });
  }

  if (escolhida) {
    return (
      <div className="bg-papel-claro mx-auto max-w-2xl rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
        <h1 className="caixa text-2xl text-salgado">Guardar no livro</h1>
        <p className="mt-2 mb-6 rounded-lg border-l-4 border-dourado bg-dourado/10 px-4 py-3 text-sm leading-relaxed">
          Ajuste o que quiser antes de guardar. Depois de fazer, poste a foto em “Fiz essa receita!”.
        </p>
        <FormularioReceita membroId={membroId} rascunho={escolhida} aoCancelar={() => setEscolhida(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={sugerir} className="bg-papel-claro rounded-2xl border border-borda px-5 py-7 shadow-sm sm:px-10">
        <h1 className="caixa text-2xl text-salgado">Sugestões para o livro</h1>
        <p className="mt-2 text-tinta-suave">
          Conte do que vocês estão com vontade. A IA sugere três receitas novas, pensando no que a família já amassou.
        </p>

        <label htmlFor="pedido" className="mt-6 mb-1.5 block text-sm font-semibold">O que vocês querem? <span className="font-normal text-tinta-suave">(opcional)</span></label>
        <textarea
          id="pedido"
          rows={3}
          maxLength={500}
          value={pedido}
          onChange={(evento) => setPedido(evento.target.value)}
          placeholder="Ex.: algo com frango e limão, sem forno, para 6 pessoas"
          className="campo leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEIAS.map((ideia) => (
            <button
              key={ideia}
              type="button"
              onClick={() => setPedido(ideia)}
              className="rounded-full border border-borda px-3 py-1 text-sm text-tinta-suave hover:border-tinta-suave hover:text-tinta"
            >
              {ideia}
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="mb-1.5 block text-sm font-semibold">Capítulo</legend>
          <div className="flex flex-wrap gap-2">
            {(["", ...Object.keys(SECOES)] as (Secao | "")[]).map((opcao) => (
              <button
                key={opcao || "todos"}
                type="button"
                aria-pressed={secao === opcao}
                onClick={() => setSecao(opcao)}
                className={`caixa rounded-full px-3.5 py-1.5 text-xs transition ${
                  secao === opcao ? "bg-capa text-papel" : "border border-borda text-tinta-suave hover:text-tinta"
                }`}
              >
                {opcao ? SECOES[opcao].nome : "Qualquer um"}
              </button>
            ))}
          </div>
        </fieldset>

        {erro && <p role="alert" className="mt-5 rounded-lg bg-salgado/10 px-4 py-3 text-salgado">{erro}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-borda pt-5">
          <button disabled={pensando} className="rounded-full bg-capa px-6 py-3 font-semibold text-papel hover:bg-capa-escura disabled:opacity-60">
            {pensando ? "Pensando…" : sugestoes ? "Sugerir outras" : "Sugerir receitas"}
          </button>
          {pensando && <span className="text-sm text-tinta-suave" aria-live="polite">Leva perto de um minuto.</span>}
        </div>
      </form>

      {sugestoes && (
        <section aria-label="Sugestões" className="mt-8 grid gap-4 lg:grid-cols-3">
          {sugestoes.map((sugestao, indice) => {
            const detalhes = [
              formatarTempo(sugestao.tempo_minutos),
              sugestao.porcoes && `${sugestao.porcoes} porções`,
              sugestao.dificuldade && DIFICULDADES[sugestao.dificuldade],
            ].filter(Boolean);
            return (
              <article key={indice} className={`flex flex-col rounded-md border border-t-4 border-borda bg-papel-claro p-5 ${BORDA[sugestao.secao]}`}>
                <p className="caixa text-[0.7rem] text-tinta-suave">
                  {bandeira(sugestao.pais)} {sugestao.pais} · {SECOES[sugestao.secao].nome}
                </p>
                <h2 className={`caixa mt-2 text-xl leading-tight ${COR[sugestao.secao]}`}>{sugestao.titulo}</h2>
                <p className="mt-2 font-serif leading-relaxed">{sugestao.descricao}</p>
                <p className="caixa mt-3 text-[0.7rem] text-tinta-suave">{detalhes.join("  ·  ")}</p>
                <p className="mt-3 rounded-md bg-dourado/10 px-3 py-2 text-sm leading-snug">{sugestao.por_que}</p>

                {aberta === indice && (
                  <div className="mt-4 space-y-4 text-sm">
                    <ul className="space-y-1">
                      {sugestao.ingredientes.map((linha, posicao) =>
                        eSubtitulo(linha) ? (
                          <li key={posicao} className={`caixa pt-2 text-[0.7rem] ${COR[sugestao.secao]}`}>{linha.replace(/:\s*$/, "")}</li>
                        ) : (
                          <li key={posicao} className="font-semibold">{linha}</li>
                        ),
                      )}
                    </ul>
                    <ol className="space-y-2">
                      {sugestao.passos.map((passo, posicao) => (
                        <li key={posicao} className="flex gap-2">
                          <span className={`caixa w-4 shrink-0 text-right ${COR[sugestao.secao]}`}>{posicao + 1}</span>
                          <span className="leading-snug">{passo}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setEscolhida(sugestao)}
                    className="rounded-full bg-capa px-4 py-2 text-sm font-semibold text-papel hover:bg-capa-escura"
                  >
                    Guardar no livro
                  </button>
                  <button
                    type="button"
                    onClick={() => setAberta(aberta === indice ? null : indice)}
                    className="rounded-full px-3 py-2 text-sm text-tinta-suave underline hover:text-tinta"
                  >
                    {aberta === indice ? "Esconder receita" : "Ver receita"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
