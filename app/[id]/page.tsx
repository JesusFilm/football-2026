import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackCrumb } from "@/components/back-crumb";
import { CountryViewsSection } from "@/components/country-views-section";
import { RegionSharePanel } from "@/components/region-share-panel";
import { Reveal } from "@/components/reveal";
import { RevealGroup } from "@/components/reveal-group";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import { StepCard } from "@/components/step-card";
import {
  fetchCountryViews,
  filterCountryViewsByRegion,
} from "@/lib/country-views";
import { fetchJourneys } from "@/lib/journeys";
import { getRegion, REGIONS } from "@/lib/regions";

export async function generateStaticParams() {
  return REGIONS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) {
    return { title: "Region" };
  }
  const title = `Activate ${region.name}`;
  const description = `${region.blurb} Share ready-to-use World Cup 2026 videos in your audience's heart language.`;
  const canonical = `/${region.id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RegionPage({ params }: Props) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) notFound();

  const [journeys, countryViewsResult] = await Promise.all([
    fetchJourneys(region.teamId),
    fetchCountryViews(),
  ]);
  const countryViews =
    countryViewsResult.status === "available"
      ? filterCountryViewsByRegion(countryViewsResult.countries, region.code)
      : [];
  const allCountryViews =
    countryViewsResult.status === "available"
      ? countryViewsResult.countries
      : [];
  const countryCountLabel =
    countryViewsResult.status === "available"
      ? String(countryViews.length)
      : "-";

  return (
    <>
      <StadiumBg />
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-10">
        <section className="px-0 pt-12 pb-9 text-center">
          <RevealGroup
            mode="hero"
            sessionKey={`region-hero:${region.id}`}
            staggerMs={80}
          >
            <div className="mb-6 flex justify-center">
              <BackCrumb href="/" label="All regions" />
            </div>
            <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              World Cup 2026 · {region.displayCode}
            </span>
            <p className="mx-0 my-2.5 mb-1 font-serif text-[clamp(16px,1.4vw,20px)] font-medium text-fg-dim italic">
              One story. Every language.
            </p>
            <h1 className="mx-0 my-1.5 mb-5 font-display text-[clamp(36px,5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
              Activate {region.name}
            </h1>
            <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
              {region.blurb} Jesus Film Project has created ready-to-use
              interactive World Cup videos to share with anyone across your
              region.
            </p>

            {/* Stats row — reveals as a single trailing unit of the hero
             * cascade (R11). The internal flag / dot / country / language
             * children do not stagger among themselves. */}
            <div className="mt-[22px] flex flex-wrap items-center justify-center gap-[18px] font-mono text-[11px] tracking-[0.12em] text-fg-mute uppercase">
              <div
                className="flex gap-1 text-[22px]"
                style={{ filter: "saturate(1.1)" }}
              >
                {region.flags.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
              <div>
                <strong className="mr-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                  {countryCountLabel}
                </strong>
                countries
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
              <div>
                <strong className="mr-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                  {journeys.length}
                </strong>
                languages
              </div>
            </div>
          </RevealGroup>
        </section>

        <RevealGroup
          mode="scroll"
          className="mx-auto mt-9 mb-14 grid max-w-[820px] grid-cols-1 gap-3.5 md:grid-cols-3"
          staggerMs={70}
        >
          <StepCard
            num="01 / CHOOSE"
            title="Choose a Language"
            body="Find videos in your local languages."
          />
          <StepCard
            num="02 / SHARE"
            title="Share It"
            body="Share the QR code or link to anyone, anywhere."
          />
          <StepCard
            num="03 / TRACK"
            title="See the Impact"
            body="Track views and shares as the story spreads, globally."
          />
        </RevealGroup>

        <RevealGroup
          mode="scroll"
          className="mx-auto mb-8 max-w-[620px] text-center"
          staggerMs={70}
        >
          <h2 className="mx-0 mt-0 mb-2.5 font-display text-[32px] font-bold tracking-[-0.01em]">
            Pick a language. Pass it on.
          </h2>
          <p className="text-[15px] leading-[1.6] text-fg-dim">
            Every video is dubbed by native speakers and captioned for sharing.
            Pick the one your audience will read in their heart, then paste the
            link anywhere you already message people.
          </p>
        </RevealGroup>

        {/* R14: share panel reveals as a single block. Keyed by region.id
         * so the reveal state resets when navigating between regions —
         * each region's panel plays its entrance on first visit. */}
        <Reveal key={`share-panel-reveal-${region.id}`}>
          <RegionSharePanel
            key={region.id}
            regionCode={region.displayCode}
            journeys={journeys}
          />
        </Reveal>

        <div className="py-5 pb-10 text-center text-fg-mute">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="inline-block animate-bob"
          >
            <path d="M7 10l5 5 5-5M7 4l5 5 5-5" />
          </svg>
        </div>

        <Reveal>
          <CountryViewsSection
            regionName={region.name}
            regionCode={region.code}
            countries={allCountryViews}
            unavailable={countryViewsResult.status === "unavailable"}
          />
        </Reveal>
      </main>

      <Reveal>
        <SiteFooter />
      </Reveal>
    </>
  );
}
