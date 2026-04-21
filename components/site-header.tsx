import { useTranslations } from "next-intl";

import { LanguagePicker } from "@/components/language-picker";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="relative z-10 flex items-center gap-4 px-6 pt-6 pb-6 sm:px-10 sm:pt-8 sm:pb-8">
      <Link
        href="/"
        className="inline-flex items-center text-fg no-underline"
        aria-label={t("homeAria")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/jfp-red.svg?v=20260421"
          alt={t("logoAlt")}
          width={186}
          height={47}
          fetchPriority="high"
          className="h-8 w-auto sm:h-9"
        />
      </Link>
      <LanguagePicker />
    </header>
  );
}
