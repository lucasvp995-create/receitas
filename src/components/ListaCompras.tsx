"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { limparCompras, marcarCompra, porNaLista } from "@/lib/acoes";
import type { ItemCompra } from "@/lib/livro";

export function ListaCompras({ itens }: { itens: ItemCompra[] }) {
  const [lista, marcar] = useOptimistic(itens, (atual, { id, feito }: { id: string; feito: boolean }) =>
    atual.map((item) => (item.id === id ? { ...item, feito } : item)),
  );
  const [novo, setNovo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [, iniciar] = useTransition();

  // Agrupa por receita, mantendo a ordem em que foram adicionadas.
  const grupos = new Map<string, ItemCompra[]>();
  for (const item of lista) {
    const chave = item.receita_titulo ?? "Outros";
    grupos.set(chave, [...(grupos.get(chave) ?? []), item]);
  }
  const marcados = lista.filter((item) => item.feito).length;

  function copiar() {
    const texto = [...grupos.entries()]
      .map(([titulo, doGrupo]) => `*${titulo}*\n${doGrupo.filter((i) => !i.feito).map((i) => `- ${i.texto}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          const texto = novo.trim();
          if (!texto) return;
          setNovo("");
          iniciar(() => porNaLista(null, null, [texto]));
        }}
        className="mb-6 flex gap-2"
      >
        <label htmlFor="novo-item" className="sr-only">Novo item</label>
        <input id="novo-item" value={novo} onChange={(evento) => setNovo(evento.target.value)} placeholder="Adicionar item (ex.: papel-toalha)" className="campo" />
        <button className="shrink-0 rounded-full bg-capa px-4 font-semibold text-papel hover:bg-capa-escura">Pôr</button>
      </form>

      {lista.length === 0 ? (
        <div className="rounded-md border border-dashed border-borda p-8 text-center text-tinta-suave">
          <p>Sua lista está vazia.</p>
          <p className="mt-1 text-sm">Numa receita, toque em “Pôr na lista de compras”: os ingredientes vêm já na quantidade de porções escolhida.</p>
          <Link href="/" className="mt-4 inline-block underline hover:text-tinta">Folhear o livro</Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {[...grupos.entries()].map(([titulo, doGrupo]) => {
              const receitaId = doGrupo[0].receita_id;
              return (
                <section key={titulo}>
                  <h2 className="caixa mb-2 text-xs text-tinta-suave">
                    {receitaId ? <Link href={`/receita/${receitaId}`} className="hover:underline">{titulo}</Link> : titulo}
                  </h2>
                  <ul className="divide-y divide-borda/70 rounded-md border border-borda bg-papel">
                    {doGrupo.map((item) => (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={item.feito}
                            onChange={() =>
                              iniciar(async () => {
                                marcar({ id: item.id, feito: !item.feito });
                                await marcarCompra(item.id, !item.feito);
                              })
                            }
                            className="size-5 accent-bebidas"
                          />
                          <span className={item.feito ? "text-tinta-suave/60 line-through" : "font-semibold"}>{item.texto}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-borda pt-5">
            <button type="button" onClick={copiar} className="rounded-full bg-capa px-4 py-2 text-sm font-semibold text-papel hover:bg-capa-escura">
              {copiado ? "Copiada!" : "Copiar para o WhatsApp"}
            </button>
            {marcados > 0 && (
              <button type="button" onClick={() => iniciar(() => limparCompras(true))} className="rounded-full px-4 py-2 text-sm text-tinta-suave hover:bg-papel-escuro">
                Tirar os marcados ({marcados})
              </button>
            )}
            <button
              type="button"
              onClick={() => confirm("Esvaziar a lista inteira?") && iniciar(() => limparCompras(false))}
              className="rounded-full px-4 py-2 text-sm text-salgado hover:bg-salgado/10"
            >
              Esvaziar lista
            </button>
          </div>
        </>
      )}
    </>
  );
}
