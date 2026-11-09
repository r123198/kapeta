import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ROOT — Curated Coffee Directory & Map",
  description: "Let's get coffee! Know the beans, know the vibe, know before you go. Discover specialty coffee spaces, lived experiences, and community happenings.",
  keywords: "coffee shops, Cagayan de Oro, specialty coffee, remote work, cafes, coffee directory, ROOT",
  authors: [{ name: "ROOT" }],
  openGraph: {
    title: "ROOT — Curated Coffee Directory & Map",
    description: "Let's get coffee! Know the beans, know the vibe, know before you go.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOT — Curated Coffee Directory & Map",
    description: "Let's get coffee! Know the beans, know the vibe, know before you go.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
        />
        <link 
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
