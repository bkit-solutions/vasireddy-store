import type { Metadata } from "next";
import { Fira_Code, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const baseFont = Manrope({
  variable: "--font-family-base",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const headingFont = Playfair_Display({
  variable: "--font-family-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const monoFont = Fira_Code({
  variable: "--font-family-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const SITE_NAME = "Vasireddy's Designer Studio";
const SITE_DESCRIPTION =
  "Discover exclusive wedding sarees, festive lehengas, silk blouses, and designer Indian wear handcrafted by Vasireddy's Designer Studio. Shop the latest bridal and ethnic collections with premium craftsmanship.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "designer studio",
    "Indian ethnic wear",
    "bridal sarees",
    "wedding lehengas",
    "silk blouses",
    "festive collections",
    "handcrafted Indian fashion",
    "Vasireddy designer",
    "exclusive Indian wear",
    "ethnic fashion online",
  ],
  authors: [{ name: "Vasireddy's Designer Studio", url: SITE_URL }],
  creator: "Vasireddy's Designer Studio",
  publisher: "Vasireddy's Designer Studio",
  category: "Fashion & Apparel",

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 1200,
        alt: "Vasireddy's Designer Studio — Exclusive Indian Fashion",
      },
    ],
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baseFont.variable} ${headingFont.variable} ${monoFont.variable} h-full`}>
      <body className="min-h-full bg-studio-cream text-studio-ink antialiased">{children}</body>
    </html>
  );
}
