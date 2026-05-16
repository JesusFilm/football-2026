import { useTranslations } from "next-intl";

export function ResourcesHero() {
  const t = useTranslations("Resources");

  return (
    <section className="px-0 pt-9 pb-12 text-center">
      <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
        {t("eyebrow")}
      </span>
      <p className="mx-0 my-[14px] mb-1.5 font-serif text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.01em] text-fg-dim italic">
        {t("tagline")}
      </p>
      <h1 className="mx-0 my-1.5 mb-5 font-display text-[clamp(36px,5vw,60px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-fg">
        {t("title")}
      </h1>
      <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
        {t("description")}
      </p>
    </section>
  );
}
