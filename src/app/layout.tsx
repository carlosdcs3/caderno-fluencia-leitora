import type { Metadata } from "next";
import "./globals.css";
import "./sales.css";

export const metadata: Metadata = {
  title: "Caderno de FluÃªncia Leitora | Leitura em boa companhia",
  description: "Atividades em PDF para ler, escrever e brincar, respeitando o ritmo da crianÃ§a. ConheÃ§a as pÃ¡ginas reais e os planos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
