import { bandeira, DIFICULDADES, eSubtitulo, formatarTempo, SECOES, type Receita } from "@/lib/livro";

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

// Uma receita numa página do livro impresso: sem botões, com quebra de página antes.
export function ReceitaImpressa({ receita }: { receita: Receita }) {
  const cor = COR[receita.secao];
  const detalhes = [
    formatarTempo(receita.tempo_minutos),
    receita.porcoes && `Rende ${receita.porcoes} ${receita.porcoes === 1 ? "porção" : "porções"}`,
    receita.dificuldade && DIFICULDADES[receita.dificuldade],
  ].filter(Boolean);
  const colunas = receita.ingredientes.length > 10 ? "columns-3" : receita.ingredientes.length > 4 ? "columns-2" : "";

  return (
    <article className="break-before-page border-b border-borda py-10 print:border-0 print:py-0">
      <p className="caixa text-right text-[0.65rem] text-tinta-suave">
        {SECOES[receita.secao].nome}  ·  {bandeira(receita.pais)} {receita.pais}
      </p>
      {receita.descricao && <p className="mx-auto mt-4 max-w-xl text-center font-serif italic leading-relaxed">{receita.descricao}</p>}
      <h2 className={`caixa mt-5 text-center text-3xl leading-tight tracking-[0.12em] ${cor}`}>{receita.titulo}</h2>
      {detalhes.length > 0 && <p className="caixa mt-3 text-center text-[0.7rem] text-tinta-suave">{detalhes.join("  ·  ")}</p>}

      <h3 className={`caixa mt-8 mb-2 text-[0.7rem] ${cor}`}>Ingredientes</h3>
      <ul className={`gap-10 text-sm ${colunas}`} style={{ columnRule: `3px double var(--color-${receita.secao})` }}>
        {receita.ingredientes.map((linha, indice) =>
          eSubtitulo(linha) ? (
            <li key={indice} className={`caixa break-after-avoid pt-2 text-[0.65rem] first:pt-0 ${cor}`}>{linha.replace(/:\s*$/, "")}</li>
          ) : (
            <li key={indice} className="break-inside-avoid py-0.5 font-semibold">{linha}</li>
          ),
        )}
      </ul>

      <ol className="mt-7 columns-2 gap-10 border-t border-borda pt-6 text-sm">
        {receita.passos.map((passo, indice) => (
          <li key={indice} className="mb-3 flex break-inside-avoid gap-2.5">
            <span className={`caixa w-4 shrink-0 text-right ${cor}`}>{indice + 1}</span>
            <p className="leading-snug">{passo}</p>
          </li>
        ))}
      </ol>

      {receita.dicas && (
        <aside className="mt-4 break-inside-avoid border-l-4 border-dourado bg-dourado/10 px-4 py-2.5 text-sm">
          <h3 className="caixa text-[0.65rem]">Dicas</h3>
          <p className="mt-1 font-serif leading-relaxed whitespace-pre-line">{receita.dicas}</p>
        </aside>
      )}
      {receita.autor && (
        <p className="mt-5 text-right text-xs text-tinta-suave">Receita de {receita.autor.nome}</p>
      )}
    </article>
  );
}
