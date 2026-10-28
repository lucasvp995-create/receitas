import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Receitas da Família", template: "%s · Receitas da Família" },
  description: "O livro de receitas da nossa família.",
  appleWebApp: { title: "Receitas", statusBarStyle: "default", capable: true },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#4a2c1d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
