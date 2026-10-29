import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { primeiroNome, quando, type VersaoRecente } from "@/lib/livro";

// As últimas fotos que a família postou, numa faixa que rola para o lado.
export function CozinhaRecente({ versoes }: { versoes: VersaoRecente[] }) {
  return (
    <ul className="flex snap-x gap-3 overflow-x-auto pb-2">
      {versoes.map((versao) =>
        versao.receita ? (
          <li key={versao.id} className="w-40 shrink-0 snap-start sm:w-48">
            <Link href={`/receita/${versao.receita.id}#na-cozinha`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-md border border-borda">
                <Image src={versao.foto_url} alt="" fill sizes="192px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
              </div>
              <p className="caixa mt-2 truncate text-[0.8rem]">{versao.receita.titulo}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-tinta-suave">
                <Avatar pessoa={versao.autor} tamanho={18} />
                {primeiroNome(versao.autor)} · {quando(versao.criado_em)}
              </p>
            </Link>
          </li>
        ) : null,
      )}
    </ul>
  );
}
