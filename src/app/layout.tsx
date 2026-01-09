import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIRRIM - Miroir de l'actualité en Mauritanie",
  description: "Agrégateur d'actualités mauritaniennes en français et arabe. Suivez les dernières nouvelles de AMI, Kassataya, Le Calame et plus.",
  keywords: ["Mauritanie", "actualités", "news", "أخبار موريتانيا", "MIRRIM"],
  openGraph: {
    title: "MIRRIM - Miroir de l'actualité en Mauritanie",
    description: "Agrégateur d'actualités mauritaniennes en français et arabe.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
