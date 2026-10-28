import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Receitas da Família",
    short_name: "Receitas",
    description: "O livro de receitas da nossa família.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e6",
    theme_color: "#4a2c1d",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
