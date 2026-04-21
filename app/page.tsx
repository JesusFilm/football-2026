import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { RegionCard } from "@/components/region-card";
import { Reveal } from "@/components/reveal";
import { RevealGroup } from "@/components/reveal-group";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import { StepCard } from "@/components/step-card";
import { fetchCountryViews } from "@/lib/country-views";
import { REGIONS } from "@/lib/regions";

export default async function Home() {
  const countryViews = await fetchCountryViews();
  const countries =
    countryViews.status === "available" ? countryViews.countries : [];

  return (
    <>
      <StadiumBg />
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-10">
        <section className="px-0 pt-16 pb-12 text-center">
          <RevealGroup mode="hero" sessionKey="home-hero" staggerMs={80}>
            <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              World Cup 2026 · Toolkit
            </span>
            <p className="mx-0 my-[14px] mb-1.5 font-serif text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.01em] text-fg-dim italic">
              One story. Every language.
            </p>
            <h1 className="mx-0 my-1.5 mb-5 font-display text-[clamp(42px,6vw,72px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-fg">
              Activate Your Region
            </h1>
            <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
              The FIFA World Cup 2026 is here. Turn the world&apos;s
              most-watched sporting event into a moment that matters. Jesus Film
              Project has created ready-to-use interactive World Cup videos to
              share with anyone across your region.
            </p>
          </RevealGroup>
        </section>

        <RevealGroup
          mode="scroll"
          className="mx-auto mt-12 mb-20 grid max-w-[820px] grid-cols-1 gap-3.5 md:grid-cols-3"
          staggerMs={70}
        >
          <StepCard
            num="01 / CHOOSE"
            title="Pick a language"
            body="Find videos in your audience's local language — over 70 options."
          />
          <StepCard
            num="02 / SHARE"
            title="Send it"
            body="Share the QR code or link anywhere — SMS, social, print, in person."
          />
          <StepCard
            num="03 / TRACK"
            title="See the impact"
            body="Watch views and shares as the story spreads across your region."
          />
        </RevealGroup>

        <RevealGroup mode="scroll" staggerMs={70}>
          <h2 className="mb-2 text-center font-display text-[28px] font-bold tracking-[-0.01em]">
            Select Your Region
          </h2>
          <p className="mb-8 text-center text-sm text-fg-dim">
            Seven regions. Pick the one you&apos;re activating.
          </p>
        </RevealGroup>

        <RevealGroup
          mode="scroll"
          className="mb-20 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-6"
          itemClassName="lg:col-span-2 lg:last:col-start-3"
          staggerMs={70}
          rowGroups={[3, 3, 1]}
          rowGapMs={160}
        >
          {REGIONS.map((r) => (
            <RegionCard key={r.id} region={r} />
          ))}
        </RevealGroup>

        {countryViews.status === "available" && (
          <Reveal>
            <HomeCountryViewsSection regions={REGIONS} countries={countries} />
          </Reveal>
        )}
      </main>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </>
  );
}
