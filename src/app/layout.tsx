import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WellFi - Wireless Below. Insight Above.",
  description:
    "Real-time downhole monitoring. Wirelessly. Through steel casing. For 5+ years. SCADA-ready wireless pressure and temperature gauges for oil and gas production.",
  keywords: [
    "downhole monitoring",
    "wireless gauge",
    "EM telemetry",
    "oil and gas",
    "SCADA",
    "pressure monitoring",
    "temperature monitoring",
    "WellFi",
    "MPS Group",
  ],
  authors: [{ name: "MPS Group", url: "https://mpsgroup.ca" }],
  openGraph: {
    title: "WellFi - Wireless Below. Insight Above.",
    description:
      "Real-time downhole monitoring through steel casing. 5+ year battery life. SCADA-ready.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
