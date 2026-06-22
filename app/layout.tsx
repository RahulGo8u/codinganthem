import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { Analytics } from "@vercel/analytics/next";

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
    default: "CodingAnthem — Free Online Developer Utilities & Tools",
    template: "%s | CodingAnthem",
  },
  description:
    "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, and more.",
  metadataBase: new URL("https://www.codinganthem.com"),
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
    canonical: "https://www.codinganthem.com",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "CodingAnthem",
    type: "website",
    url: "https://www.codinganthem.com",
    title: "CodingAnthem — Free Online Developer Utilities & Tools",
    description:
      "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, convert timestamps, and more.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodingAnthem — Free Online Developer Utilities & Tools",
    description:
      "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, and more.",
    images: ["/opengraph-image"],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "CodingAnthem",
      url: "https://www.codinganthem.com",
      logo: "https://www.codinganthem.com/apple-touch-icon.png",
      sameAs: ["https://github.com/RahulGo8u/codinganthem"],
    },
    {
      "@type": "WebSite",
      name: "CodingAnthem",
      url: "https://www.codinganthem.com",
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HZ86NBTX6L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HZ86NBTX6L');
          `}
        </Script>

        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="codinganthem.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />

        <Providers>
          <Nav />
          <CommandPalette />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
