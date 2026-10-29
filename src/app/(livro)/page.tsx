import Link from "next/link";
import { Capa } from "@/components/Capa";
import { GradeReceitas, Subtitulo } from "@/components/CartaoReceita";
import { CozinhaRecente } from "@/components/CozinhaRecente";
import { contarPorSecao, receitasRecentes, versoesRecentes } from "@/lib/dados";
import { SECOES, type Secao } from "@/lib/livro";

const ABA = {
  salgado: "border-t-salgado text-salgado",
  doce: "border-t-doce text-doce",
  bebidas: "border-t-bebidas text-bebidas",
};

export default async function IndicePage() {
  const [contagem, recentes, cozinha] = await Promise.all([contarPorSecao(), receitasRecentes(), versoesRecentes()]);
  const total = contagem.salgado + contagem.doce + contagem.bebidas;

  return (
    <div className="space-y-10">
      <Capa compacta>
        <p className="caixa text-xs tracking-[0.2em]">
          {total === 0 ? "Um livro novinho, esperando a primeira receita" : `${total} ${total === 1 ? "receita" : "receitas"}`}
        </p>
      </Capa>

      <section aria-labelledby="capitulos">
        <Subtitulo id="capitulos">Capítulos</Subtitulo>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(SECOES) as Secao[]).map((secao) => (
            <Link
              key={secao}
              href={`/secao/${secao}`}
              className={`rounded-md border border-borda border-t-4 bg-papel-claro p-5 transition hover:shadow-md ${ABA[secao]}`}
            >
              <span className="caixa text-2xl">{SECOES[secao].nome}</span>
              <span className="mt-1 block font-serif text-tinta-suave italic">{SECOES[secao].frase}</span>
              <span className="caixa mt-4 block text-xs">
                {contagem[secao]} {contagem[secao] === 1 ? "receita" : "receitas"} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Atalhos">
        <Link href="/sugestoes" className="rounded-md border border-dourado bg-dourado/10 p-4 transition hover:bg-dourado/20">
          <span className="caixa text-sm">Sem ideia para hoje?</span>
          <span className="mt-1 block text-sm text-tinta-suave">Peça sugestões de receitas novas para a IA →</span>
        </Link>
        <Link href="/compras" className="rounded-md border border-borda bg-papel-claro p-4 transition hover:shadow-md">
          <span className="caixa text-sm text-bebidas">Lista de compras</span>
          <span className="mt-1 block text-sm text-tinta-suave">Os ingredientes que você separou para comprar →</span>
        </Link>
      </section>

      {cozinha.length > 0 && (
        <section aria-labelledby="cozinha">
          <Subtitulo id="cozinha">Na cozinha da família</Subtitulo>
          <CozinhaRecente versoes={cozinha} />
        </section>
      )}

      <section aria-labelledby="recentes">
        <Subtitulo id="recentes">Adicionadas recentemente</Subtitulo>
        {recentes.length > 0 ? (
          <GradeReceitas receitas={recentes} />
        ) : (
          <div className="bg-papel-claro rounded-md border border-dashed border-borda p-8 text-center">
            <p className="text-tinta-suave">Ainda não há receitas no livro.</p>
            <Link
              href="/nova"
              className="mt-4 inline-block rounded-full bg-capa px-5 py-2.5 font-semibold text-papel hover:bg-capa-escura"
            >
              Escrever a primeira receita
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
