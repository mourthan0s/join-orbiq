import type { Metadata, Viewport } from "next";
import { Commissioner, Literata } from "next/font/google";
import { getAppUrl } from "@/lib/urls/app-url";
import "./globals.css";

const commissioner = Commissioner({
  variable: "--font-commissioner",
  subsets: ["latin", "greek"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "greek"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getAppUrl(),
  title: "ORBIQ Join",
  description: "Venue guest list registration by ORBIQ.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e0e12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body className={`${commissioner.variable} ${literata.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
