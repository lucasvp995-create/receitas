import Link from "next/link";
import { Capa } from "@/components/Capa";
import { GradeReceitas } from "@/components/CartaoReceita";
import { contarPorSecao, receitasRecentes } from "@/lib/dados";
import { SECOES, type Secao } from "@/lib/livro";

const ABA = {
  salgado: "border-salgado/40 hover:border-salgado text-salgado",
  doce: "border-doce/40 hover:border-doce text-doce",
  bebidas: "border-bebidas/40 hover:border-bebidas text-bebidas",
};

export default async function IndicePage() {
  const [contagem, recentes] = await Promise.all([contarPorSecao(), receitasRecentes()]);
  const total = contagem.salgado + contagem.doce + contagem.bebidas;

  return (
    <div className="space-y-10">
      <Capa compacta>
        <p className="mt-4 text-sm text-papel/70">
          {total === 0 ? "Um livro novinho, esperando a primeira receita" : `${total} ${total === 1 ? "receita" : "receitas"}`}
        </p>
      </Capa>

      <section aria-labelledby="capitulos">
        <h2 id="capitulos" className="mb-3 font-titulo text-2xl font-semibold">Capítulos</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(SECOES) as Secao[]).map((secao) => (
            <Link
              key={secao}
              href={`/secao/${secao}`}
              className={`folha rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${ABA[secao]}`}
            >
              <span className="font-titulo text-3xl font-semibold">{SECOES[secao].nome}</span>
              <span className="mt-1 block text-sm text-tinta-suave">{SECOES[secao].frase}</span>
              <span className="mt-4 block text-sm font-semibold">
                {contagem[secao]} {contagem[secao] === 1 ? "receita" : "receitas"} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recentes">
        <h2 id="recentes" className="mb-3 font-titulo text-2xl font-semibold">Adicionadas recentemente</h2>
        {recentes.length > 0 ? (
          <GradeReceitas receitas={recentes} />
        ) : (
          <div className="folha rounded-xl border border-dashed border-borda p-8 text-center">
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
