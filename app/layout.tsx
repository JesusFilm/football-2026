import type { Metadata } from "next";
import { Archivo, Fraunces, Inter, JetBrains_Mono } from "next/font/google";

import { RouteTransitionState } from "@/components/route-transition-state";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  sharedOpenGraph,
  sharedTwitter,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

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
  preload: false,
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  preload: false,
  variable: "--font-mono",
});

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
    ...sharedOpenGraph,
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    ...sharedTwitter,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

const organizationSchema = {
  "@type": "Organization",
  "@id": "https://www.jesusfilm.org/#organization",
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

const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: {
    "@id": "https://www.jesusfilm.org/#organization",
  },
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <RouteTransitionState />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteSchema),
          }}
        />
      </body>
    </html>
  );
}
