import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-head",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "tibalascopa",
  description: "Plataforma premium de estatísticas, histórico e agente de IA para copas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable} ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  );
}
