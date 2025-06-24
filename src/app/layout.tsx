import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "kapeta! - Discover Iligan's Best Coffee Shops",
  description: "Let's get coffee! Know the beans, know the vibe, know before you go. Your local guide to work-friendly cafes in Iligan City.",
  keywords: "coffee shops, Iligan City, remote work, cafes, coffee directory, kapeta",
  authors: [{ name: "kapeta!" }],
  openGraph: {
    title: "kapeta! - Discover Iligan's Best Coffee Shops",
    description: "Let's get coffee! Know the beans, know the vibe, know before you go.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "kapeta! - Discover Iligan's Best Coffee Shops",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
