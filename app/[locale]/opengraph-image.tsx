import { contentType, OpenGraphImage, size } from "@/components/social-image";
import { defaultLocale, type Locale } from "@/i18n/routing";

export { contentType, size };

type MetadataMessages = {
  Metadata: {
    socialAlt: string;
    ogBrand: string;
    ogHeadline: string;
    ogTagline: string;
  };
};

async function getMetadataMessages(locale: Locale) {
  return (await import(`@/messages/${locale}.json`))
    .default as MetadataMessages;
}

export async function generateImageMetadata({
  params,
}: {
  params?: Promise<{ locale?: Locale }>;
}) {
  const { locale = defaultLocale } = (await params) ?? {};
  const messages = await getMetadataMessages(locale);

  return [
    {
      id: locale,
      alt: messages.Metadata.socialAlt,
      contentType,
      size,
    },
  ];
}

export default async function Image({
  params,
}: {
  params?: Promise<{ locale?: Locale }>;
}) {
  const { locale = defaultLocale } = (await params) ?? {};
  const messages = await getMetadataMessages(locale);

  return OpenGraphImage({
    brand: messages.Metadata.ogBrand,
    headline: messages.Metadata.ogHeadline,
    tagline: messages.Metadata.ogTagline,
  });
}
