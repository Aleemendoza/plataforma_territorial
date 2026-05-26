import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jujuy Alerta Territorial",
  description: "Centro operativo geoespacial para monitoreo y alerta temprana."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

