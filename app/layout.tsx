import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodingAnthem — Developer Tools That Just Work",
    template: "%s | CodingAnthem",
  },
  description:
    "Fast, free developer tools that run entirely in your browser. JSON formatter, Base64 encoder, UUID generator, regex tester, hash generator, and more. No signup required.",
  metadataBase: new URL("https://codinganthem.com"),
  keywords: [
    "developer tools",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "regex tester",
    "hash generator",
    "timestamp converter",
    "color converter",
    "case converter",
    "text diff",
    "online developer tools",
    "free dev tools",
  ],
  alternates: {
    canonical: "https://codinganthem.com",
  },
  openGraph: {
    siteName: "CodingAnthem",
    type: "website",
    url: "https://codinganthem.com",
    title: "CodingAnthem — Developer Tools That Just Work",
    description:
      "Fast, free developer tools that run entirely in your browser. No signup required.",
  },
  twitter: {
    card: "summary",
    title: "CodingAnthem — Developer Tools That Just Work",
    description:
      "Fast, free developer tools that run entirely in your browser. No signup required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Nav />
          <CommandPalette />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
