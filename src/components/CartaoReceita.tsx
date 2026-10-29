import Image from "next/image";
import Link from "next/link";
import { bandeira, formatarTempo, SECOES, type ResumoReceita } from "@/lib/livro";

const FUNDO_SEM_FOTO = {
  salgado: "bg-salgado/15 text-salgado",
  doce: "bg-doce/15 text-doce",
  bebidas: "bg-bebidas/15 text-bebidas",
};

export function CartaoReceita({ receita }: { receita: ResumoReceita }) {
  const tempo = formatarTempo(receita.tempo_minutos);
  return (
    <Link
      href={`/receita/${receita.id}`}
      className="group overflow-hidden rounded-md border border-borda bg-papel-claro transition hover:-translate-y-0.5 hover:border-tinta/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {receita.foto_capa ? (
          <Image
            src={receita.foto_capa}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center font-display text-6xl font-black ${FUNDO_SEM_FOTO[receita.secao]}`}
            style={{ fontVariationSettings: '"SOFT" 100' }}
          >
            {receita.titulo.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="caixa text-[0.95rem] leading-snug">{receita.titulo}</h3>
        <p className="mt-1 text-sm text-tinta-suave">
          {bandeira(receita.pais)} {receita.pais}
          {receita.categoria ? ` · ${receita.categoria}` : ` · ${SECOES[receita.secao].nome}`}
          {tempo ? ` · ${tempo}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function GradeReceitas({ receitas }: { receitas: ResumoReceita[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {receitas.map((receita) => (
        <CartaoReceita key={receita.id} receita={receita} />
      ))}
    </div>
  );
}

// Um subtítulo de seção com um fio fino, como nos livros.
export function Subtitulo({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="caixa mb-4 flex items-center gap-3 text-sm text-tinta-suave">
      {children}
      <span className="h-px flex-1 bg-borda" aria-hidden />
    </h2>
  );
}
