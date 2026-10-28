// A capa de couro do livro, usada no login e no topo do índice.
export function Capa({ children, compacta = false }: { children?: React.ReactNode; compacta?: boolean }) {
  return (
    <div
      className={`capa-couro relative overflow-hidden rounded-r-2xl rounded-l-md text-papel shadow-[0_18px_40px_-18px_rgb(54_32_15/0.7)] ${
        compacta ? "px-6 py-8 sm:px-10" : "px-8 py-14 sm:px-12"
      }`}
    >
      {/* lombada */}
      <div className="absolute inset-y-0 left-0 w-3 bg-capa-escura/70" aria-hidden />
      <div className="absolute inset-3 left-6 rounded-r-xl border border-dourado/40" aria-hidden />
      <div className="relative text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-dourado uppercase">Livro de</p>
        <h1 className={`font-titulo font-semibold text-dourado ${compacta ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl"}`}>
          Receitas
        </h1>
        <p className="mt-1 font-titulo text-lg italic text-papel/85">da Família</p>
        {children}
      </div>
    </div>
  );
}
