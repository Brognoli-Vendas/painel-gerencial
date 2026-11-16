import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Painel gerencial Brognoli", template: "%s · Painel gerencial Brognoli" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
