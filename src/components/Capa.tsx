// A capa do livro: amarelo âmbar com letras azul-noite e uma panela desenhada a traço.
export function Capa({ children, compacta = false }: { children?: React.ReactNode; compacta?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-dourado text-tinta shadow-[0_18px_40px_-20px_rgb(43_45_62/0.6)] ${
        compacta ? "px-6 pt-8 pb-6 sm:px-10" : "px-8 pt-12 pb-8 sm:px-12"
      }`}
    >
      <div className="relative text-center">
        <p className="caixa text-xs tracking-[0.35em]">Livro de</p>
        <h1
          className={`font-display leading-[0.9] font-black tracking-tight ${compacta ? "text-6xl sm:text-7xl" : "text-7xl"}`}
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}
        >
          Receitas
        </h1>
        <p className="caixa mt-2 text-sm tracking-[0.3em]">da Família</p>
        <Panela className={`mx-auto ${compacta ? "mt-3 w-44 sm:w-52" : "mt-6 w-60"}`} />
        {children}
      </div>
    </div>
  );
}

function Panela({ className }: { className?: string }) {
  const tinta = "var(--color-tinta)";
  const papel = "var(--color-papel-claro)";
  return (
    <svg viewBox="0 0 240 150" className={className} aria-hidden>
      <path d="M121 64c-14-12 10-20-2-34s8-18 2-28" fill="none" stroke={papel} strokeWidth="9" strokeLinecap="round" opacity="0.9" />
      <path d="M100 62c-6-8 6-14-2-22" fill="none" stroke={papel} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M142 60c6-8-5-13 2-21" fill="none" stroke={papel} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M52 82h-14a9 9 0 0 0 0 18h14M188 82h14a9 9 0 0 1 0 18h-14" fill="none" stroke={tinta} strokeWidth="3" />
      <path d="M52 72h136v46c0 13-9 22-22 22H74c-13 0-22-9-22-22z" fill={papel} stroke={tinta} strokeWidth="3" />
      <ellipse cx="120" cy="72" rx="70" ry="10" fill={papel} stroke={tinta} strokeWidth="3" />
      <ellipse cx="120" cy="73" rx="60" ry="5.5" fill="var(--color-dourado)" />
      <text x="120" y="104" textAnchor="middle" fill={tinta} fontSize="10.5" fontWeight="700" letterSpacing="1.2" style={{ fontFamily: "var(--font-jost)" }}>
        SALGADOS, DOCES
      </text>
      <text x="120" y="122" textAnchor="middle" fill={tinta} fontSize="10.5" fontWeight="700" letterSpacing="1.2" style={{ fontFamily: "var(--font-jost)" }}>
        &amp; BEBIDAS
      </text>
    </svg>
  );
}
