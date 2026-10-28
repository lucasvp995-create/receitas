import Image from "next/image";
import Link from "next/link";
import { getMembro } from "@/lib/dados";
import { sair } from "@/lib/acoes";

export default async function LivroLayout({ children }: LayoutProps<"/">) {
  const membro = await getMembro();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-borda/80 bg-papel/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="font-titulo text-xl font-semibold text-capa">
            Receitas <span className="italic font-normal text-tinta-suave">da Família</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/busca"
              aria-label="Buscar receitas"
              className="rounded-full p-2 text-tinta-suave hover:bg-papel-escuro hover:text-tinta"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              href="/nova"
              className="rounded-full bg-capa px-3.5 py-1.5 text-sm font-semibold text-papel hover:bg-capa-escura"
            >
              + Nova<span className="hidden sm:inline"> receita</span>
            </Link>
            <details className="relative">
              <summary className="list-none cursor-pointer rounded-full p-0.5 [&::-webkit-details-marker]:hidden" aria-label="Conta">
                {membro.avatar_url ? (
                  <Image src={membro.avatar_url} alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dourado font-semibold text-capa">
                    {membro.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-borda bg-papel-claro p-2 shadow-lg">
                <p className="truncate px-2 py-1.5 text-sm font-semibold">{membro.nome}</p>
                <form action={sair}>
                  <button className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-tinta-suave hover:bg-papel-escuro hover:text-tinta">
                    Sair
                  </button>
                </form>
              </div>
            </details>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6">{children}</main>
    </>
  );
}
