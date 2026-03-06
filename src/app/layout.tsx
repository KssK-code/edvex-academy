import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ESCUELA_CONFIG } from "@/lib/config";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const description = "Plataforma de educación media superior 100% en línea. Estudia a tu ritmo, las 24 horas del día."

export const viewport: Viewport = {
  themeColor: "#0B0D11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: `${ESCUELA_CONFIG.nombre} | Bachillerato Virtual`,
    template: `%s | ${ESCUELA_CONFIG.nombre}`,
  },
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: ESCUELA_CONFIG.nombre,
    description,
    type: "website",
    locale: "es_MX",
    siteName: ESCUELA_CONFIG.nombre,
  },
  twitter: {
    card: "summary",
    title: ESCUELA_CONFIG.nombre,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
