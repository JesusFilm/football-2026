import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-20 border-t border-line px-10 pt-6 pb-7 text-center text-xs text-fg-mute">
      {t("copyright")} · {t("rights")} ·{" "}
      <a
        href="https://www.jesusfilm.org/terms/"
        target="_blank"
        rel="noreferrer"
        className="mx-1 text-fg-dim underline underline-offset-2 hover:text-fg"
      >
        {t("terms")}
      </a>{" "}
      ·{" "}
      <a
        href="https://www.jesusfilm.org/privacy/"
        target="_blank"
        rel="noreferrer"
        className="mx-1 text-fg-dim underline underline-offset-2 hover:text-fg"
      >
        {t("privacy")}
      </a>
    </footer>
  );
}
