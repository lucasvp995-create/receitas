import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getMembro } from "@/lib/dados";
import { sair } from "@/lib/acoes";

export default async function LivroLayout({ children }: LayoutProps<"/">) {
  const membro = await getMembro();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-borda/80 bg-papel/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="flex items-baseline gap-2 text-tinta">
            <span className="font-display text-2xl font-black" style={{ fontVariationSettings: '"SOFT" 100' }}>Receitas</span>
            <span className="caixa hidden text-[0.7rem] text-tinta-suave min-[380px]:inline">da Família</span>
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
                <Avatar pessoa={membro} tamanho={32} />
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-borda bg-papel-claro p-2 shadow-lg">
                <p className="truncate px-2 py-1.5 text-sm font-semibold">{membro.nome}</p>
                <Link href="/perfil" className="block rounded-lg px-2 py-1.5 text-sm text-tinta-suave hover:bg-papel-escuro hover:text-tinta">
                  Meu perfil
                </Link>
                <Link href="/favoritas" className="block rounded-lg px-2 py-1.5 text-sm text-tinta-suave hover:bg-papel-escuro hover:text-tinta">
                  Quero fazer
                </Link>
                <Link href="/importar" className="block rounded-lg px-2 py-1.5 text-sm text-tinta-suave hover:bg-papel-escuro hover:text-tinta">
                  Importar receita
                </Link>
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
