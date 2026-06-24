import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { meta } from "@/lib/content";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mpsgroup.energy'),
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: "https://mpsgroup.energy/wellfi",
  },
  keywords: [
    "PCP wells",
    "production uplift",
    "pump changeout",
    "downhole pressure",
    "wireless telemetry",
    "heavy oil",
    "Bluesky Formation",
    "Clearwater Formation",
    "Peace River",
    "WellFi",
    "MPS Group",
    "Know the Unknown",
  ],
  authors: [{ name: "MPS Group", url: "https://mpsgroup.energy/" }],
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: "website",
    url: "https://mpsgroup.energy/wellfi",
    siteName: "MPS Group — WellFi",
    images: [
      {
        url: "https://mpsgroup.energy/wellfi/og-wellfi.png",
        width: 1200,
        height: 630,
        alt: "WellFi by MPS Group — wireless downhole telemetry that brings pressure, temperature, and vibration to surface.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: ["https://mpsgroup.energy/wellfi/og-wellfi.png"],
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
