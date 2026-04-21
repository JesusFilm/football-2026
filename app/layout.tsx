import type { Metadata } from "next";
import { Archivo, Fraunces, Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const SITE_NAME = "Jesus Film Project · World Cup 2026 Activate";
const SITE_URL = "https://football2026.nextstep.is";
const DEFAULT_TITLE = "World Cup 2026 · Activate Your Region";
const DEFAULT_DESCRIPTION =
  "Jesus Film Project Activate — share ready-to-use World Cup 2026 videos in your audience's heart language.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · Activate · World Cup 2026",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Jesus Film Project",
  alternateName: "JFP",
  url: "https://www.jesusfilm.org",
  logo: "https://www.jesusfilm.org/wp-content/uploads/2023/04/JFP-RED.svg",
  sameAs: [
    "https://www.facebook.com/jesusfilm",
    "https://www.instagram.com/jesusfilm",
    "https://www.youtube.com/jesusfilm",
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
      className={`motion-ready ${archivo.variable} ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </body>
    </html>
  );
}
