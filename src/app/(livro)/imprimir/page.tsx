import type { Metadata } from "next";
import Link from "next/link";
import { BotaoImprimir } from "@/components/BotaoImprimir";
import { Capa } from "@/components/Capa";
import { ReceitaImpressa } from "@/components/ReceitaImpressa";
import { receitasParaImprimir } from "@/lib/dados";
import { bandeira, eSecao, SECOES, type Secao } from "@/lib/livro";

export const metadata: Metadata = { title: "Imprimir o livro" };

const COR = { salgado: "text-salgado", doce: "text-doce", bebidas: "text-bebidas" };

export default async function ImprimirPage({ searchParams }: PageProps<"/imprimir">) {
  const { secao } = await searchParams;
  const escolhida = typeof secao === "string" && eSecao(secao) ? secao : null;
  const receitas = await receitasParaImprimir(escolhida);
  const capitulos = (Object.keys(SECOES) as Secao[]).filter((s) => !escolhida || s === escolhida);
  const opcao = (ativo: boolean) =>
    `caixa rounded-full px-3.5 py-1.5 text-xs ${ativo ? "bg-capa text-papel" : "border border-borda text-tinta-suave hover:text-tinta"}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-papel-claro mb-8 rounded-2xl border border-borda px-5 py-6 shadow-sm print:hidden sm:px-8">
        <h1 className="caixa text-2xl text-salgado">Imprimir o livro</h1>
        <p className="mt-1 text-tinta-suave">
          Cada receita começa numa página nova. No celular ou no computador, escolha “Salvar como PDF” na tela de impressão
          para guardar ou mandar o livro.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/imprimir" className={opcao(!escolhida)}>Livro inteiro</Link>
          {(Object.keys(SECOES) as Secao[]).map((s) => (
            <Link key={s} href={`/imprimir?secao=${s}`} className={opcao(escolhida === s)}>{SECOES[s].nome}</Link>
          ))}
        </div>
        <BotaoImprimir
          rotulo={`Imprimir ${receitas.length} ${receitas.length === 1 ? "receita" : "receitas"}`}
          className="mt-5 rounded-full bg-capa px-6 py-3 font-semibold text-papel hover:bg-capa-escura"
        />
      </div>

      <div className="mx-auto max-w-sm print:mt-20 print:max-w-md">
        <Capa>
          <p className="caixa text-xs tracking-[0.2em]">
            {escolhida ? SECOES[escolhida].nome : `${receitas.length} receitas`}
          </p>
        </Capa>
      </div>

      <section className="break-before-page py-10 print:py-0">
        <h2 className="caixa mb-6 text-center text-xl tracking-[0.15em]">Sumário</h2>
        {capitulos.map((capitulo) => {
          const doCapitulo = receitas.filter((r) => r.secao === capitulo);
          if (doCapitulo.length === 0) return null;
          return (
            <div key={capitulo} className="mb-6 break-inside-avoid">
              <h3 className={`caixa mb-2 text-sm ${COR[capitulo]}`}>{SECOES[capitulo].nome}</h3>
              <ul className="columns-2 gap-8 text-sm">
                {doCapitulo.map((r) => (
                  <li key={r.id} className="break-inside-avoid py-0.5">
                    {r.titulo} <span className="text-tinta-suave">{bandeira(r.pais)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {receitas.map((receita) => (
        <ReceitaImpressa key={receita.id} receita={receita} />
      ))}
    </div>
  );
}
