"use client";

export function BotaoImprimir({ rotulo = "Imprimir", className = "" }: { rotulo?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={`print:hidden ${className}`}>
      {rotulo}
    </button>
  );
}
