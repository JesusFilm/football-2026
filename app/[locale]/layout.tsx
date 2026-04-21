import type { Metadata } from "next";
import { Archivo, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { RouteTransitionState } from "@/components/route-transition-state";
import {
  getLocaleDirection,
  getLocaleOption,
  locales,
  routing,
  type Locale,
} from "@/i18n/routing";
import { sharedOpenGraph, sharedTwitter, SITE_URL } from "@/lib/site";

import "flag-icons/css/flag-icons.min.css";
import "../globals.css";

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

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

function createSiteSchema(siteName: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: siteName,
        url: SITE_URL,
        publisher: {
          "@id": "https://www.jesusfilm.org/#organization",
        },
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const option = getLocaleOption(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const imageAlt = t("socialAlt");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate", { title: "%s" }),
    },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
    },
    openGraph: {
      ...sharedOpenGraph(locale, imageAlt, t("siteName")),
      locale: option.openGraphLocale,
      url: locale === "en" ? SITE_URL : `${SITE_URL}/${locale}`,
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    twitter: {
      ...sharedTwitter(locale),
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteSchema = createSiteSchema(t("siteName"));

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale as Locale)}
      className={`${archivo.variable} ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <RouteTransitionState />
          {children}
        </NextIntlClientProvider>
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
