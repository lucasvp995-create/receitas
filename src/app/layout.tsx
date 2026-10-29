import type { Metadata, Viewport } from "next";
import { Barlow, Fraunces, Jost } from "next/font/google";
import "./globals.css";

// Serifa encorpada para capa e textos, caixa alta geométrica para títulos, sans limpa para receitas
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "opsz"] });
const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Receitas da Família", template: "%s · Receitas da Família" },
  description: "O livro de receitas da nossa família.",
  appleWebApp: { title: "Receitas", statusBarStyle: "default", capable: true },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#d7a852",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${jost.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
