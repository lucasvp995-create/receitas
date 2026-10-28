// A capa do livro, inspirada em "An A-Z of Pasta": fundo âmbar, uma panela grande desenhada
// a traço azul-noite e uma nuvem de vapor creme que sobe levando o título.
export function Capa({ children, compacta = false }: { children?: React.ReactNode; compacta?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-dourado text-tinta shadow-[0_18px_40px_-20px_rgb(43_45_62/0.6)] ${
        compacta ? "px-4 pb-5" : "px-4 pb-8"
      }`}
    >
      <Ilustracao className={`mx-auto block w-full ${compacta ? "max-w-[300px]" : "max-w-[340px]"}`} />
      {children && <div className="relative text-center">{children}</div>}
    </div>
  );
}

const TINTA = "var(--color-tinta)";
const CREME = "var(--color-papel-claro)";
const AMBAR = "var(--color-dourado)";

// Gerador pseudoaleatório com semente fixa: o pontilhado sai igual no servidor e no navegador.
function aleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// Pontinhos de vapor saindo pelas bordas da nuvem, mais densos perto da panela.
const BORDA_ESQUERDA: [number, number][] = [[150, 78], [215, 66], [250, 84], [275, 104], [300, 128]];
const BORDA_DIREITA: [number, number][] = [[150, 332], [215, 333], [250, 314], [275, 293], [300, 272]];

function bordaEm(borda: [number, number][], y: number) {
  for (let i = 1; i < borda.length; i++) {
    const [y0, x0] = borda[i - 1];
    const [y1, x1] = borda[i];
    if (y <= y1) return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  }
  return borda[borda.length - 1][1];
}

const PONTOS = (() => {
  const r = aleatorio(11);
  const pontos: { x: number; y: number; raio: number }[] = [];
  for (let i = 0; i < 420; i++) {
    const y = 150 + Math.pow(r(), 0.6) * 152;
    const lado = r() < 0.5 ? -1 : 1;
    const borda = bordaEm(lado < 0 ? BORDA_ESQUERDA : BORDA_DIREITA, y);
    const afastamento = Math.pow(r(), 2.2) * (10 + (y - 150) * 0.28);
    pontos.push({ x: borda + lado * (afastamento - 2), y, raio: 0.7 + r() * 1.5 });
  }
  return pontos;
})();

// Traços verticais de sombra nas laterais da panela.
const HACHURAS = [
  ...[64, 70, 76, 82, 88, 95].map((x, i) => ({ x, y1: 350 + i * 4, y2: 455 - i * 6 })),
  ...[336, 330, 324, 318, 312, 305].map((x, i) => ({ x, y1: 350 + i * 4, y2: 455 - i * 6 })),
];

const BOLHAS = [
  { x: 232, y: 300, r: 6 },
  { x: 246, y: 305, r: 4 },
  { x: 222, y: 309, r: 3.5 },
  { x: 258, y: 298, r: 3 },
  { x: 150, y: 302, r: 4.5 },
  { x: 139, y: 307, r: 3 },
  { x: 285, y: 306, r: 2.5 },
];

function Ilustracao({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 500" overflow="visible" className={className} role="img" aria-label="Livro de Receitas da Família">
      {/* vapor */}
      <path
        d="M128 300C100 270 70 250 66 215C62 180 92 165 80 135C68 105 30 88 40 52C48 22 20 10 24 -2H380C384 20 350 36 352 70C354 108 322 130 330 165C338 200 330 240 300 268C288 280 278 290 272 300Z"
        fill={CREME}
      />
      <g fill={CREME}>
        {PONTOS.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.raio.toFixed(2)} />
        ))}
      </g>

      {/* fio de macarrão subindo pelo vapor */}
      <path
        d="M212 300C240 268 176 250 204 214C226 186 250 170 226 140C208 118 172 110 196 80C214 58 236 40 214 6"
        fill="none"
        stroke={AMBAR}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* título */}
      <g fill={TINTA} textAnchor="middle">
        <text x="200" y="64" fontSize="13" fontWeight="700" letterSpacing="5" style={{ fontFamily: "var(--font-jost)" }}>
          LIVRO DE
        </text>
        <text
          x="200"
          y="132"
          fontSize="66"
          fontWeight="900"
          letterSpacing="-1"
          style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: '"SOFT" 100, "opsz" 144' }}
        >
          Receitas
        </text>
        <text x="200" y="168" fontSize="15" fontWeight="700" letterSpacing="5" style={{ fontFamily: "var(--font-jost)" }}>
          DA FAMÍLIA
        </text>
      </g>

      {/* alças */}
      <g fill="none" stroke={TINTA} strokeWidth="3" strokeLinecap="round">
        <path d="M54 318C28 308 8 316 12 333C16 348 36 350 58 346" fill={CREME} />
        <path d="M52 326C34 320 22 324 24 333C26 340 38 341 56 338" />
        <path d="M346 318C372 308 392 316 388 333C384 348 364 350 342 346" fill={CREME} />
        <path d="M348 326C366 320 378 324 376 333C374 340 362 341 344 338" />
      </g>

      {/* corpo */}
      <path
        d="M50 305L58 440Q62 480 110 484H290Q338 480 342 440L350 305Z"
        fill={CREME}
        stroke={TINTA}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <g stroke={TINTA} strokeWidth="1.6" strokeLinecap="round">
        {HACHURAS.map((h, i) => (
          <line key={i} x1={h.x} y1={h.y1} x2={h.x + (h.x < 200 ? 2 : -2)} y2={h.y2} />
        ))}
        <path d="M78 468Q120 478 200 478Q280 478 322 468" fill="none" />
      </g>

      {/* borda e caldo */}
      <ellipse cx="200" cy="305" rx="150" ry="34" fill={CREME} stroke={TINTA} strokeWidth="3.5" />
      <ellipse cx="200" cy="306" rx="137" ry="26" fill={AMBAR} stroke={TINTA} strokeWidth="2" />
      <g fill="none" stroke="#b98a35" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M110 300C140 292 170 296 190 304" />
        <path d="M168 314C200 320 240 318 268 312" />
        <path d="M96 312C108 316 124 318 140 318" />
      </g>
      <g fill={CREME} stroke={TINTA} strokeWidth="1.6">
        {BOLHAS.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </g>

      {/* texto na panela: o que a família diz quando vê uma foto de comida */}
      <g fill={TINTA} textAnchor="middle" style={{ fontFamily: "var(--font-jost)" }}>
        <text x="200" y="402" fontSize="33" fontWeight="800" letterSpacing="0.5">
          AMASSAVA!
        </text>
        <text x="200" y="430" fontSize="12" fontWeight="700" letterSpacing="2.5">
          SALGADOS, DOCES
        </text>
        <text x="200" y="448" fontSize="12" fontWeight="700" letterSpacing="2.5">
          &amp; BEBIDAS
        </text>
      </g>
    </svg>
  );
}
