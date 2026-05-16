import { useTranslations } from "next-intl";

import { ShareButton } from "@/components/share-button";
import { Link } from "@/i18n/navigation";
import { LAUNCH_EVENT } from "@/lib/launch-event";

const CAL_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const CLOCK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const HOURGLASS_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2h12M6 22h12M6 2v5l6 5-6 5v5M18 2v5l-6 5 6 5v5" />
  </svg>
);

const CAMERA_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M22 8l-6 4 6 4V8z" />
  </svg>
);

const TICKET_ICON = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" />
    <path d="M10 7v10" />
  </svg>
);

const ARROW_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="rtl-mirror"
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const EXT_ICON = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
    className="rtl-mirror"
  >
    <path d="M3 11L11 3M5 3h6v6" />
  </svg>
);

const SHARE_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M8.6 10.6l6.8-3.2M8.6 13.4l6.8 3.2" />
  </svg>
);

// Shared event-details helper so iCal (.ics) and Google Calendar links
// surface identical information: the localized description, plus the
// registration URL and Meeting ID for at-a-glance reference.
function buildEventDetails(opts: {
  description: string;
  url: string;
  meetingId: string;
  registerLabel: string;
  meetingIdLabel: string;
}) {
  return [
    opts.description,
    "",
    `${opts.registerLabel}: ${opts.url}`,
    `${opts.meetingIdLabel}: ${opts.meetingId}`,
  ].join("\n");
}

function buildIcsDataUri(opts: {
  title: string;
  details: string;
  startIso: string;
  durationMinutes: number;
  url: string;
}) {
  const start = new Date(opts.startIso);
  const end = new Date(start.getTime() + opts.durationMinutes * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;
  const escape = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jesus Film Project//World Cup 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:wc2026-launch-${start.getTime()}@jesusfilm.org`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escape(opts.title)}`,
    `DESCRIPTION:${escape(opts.details)}`,
    `URL:${opts.url}`,
    "LOCATION:Zoom",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

// Google Calendar pre-fill URL.
// Reference: https://stackoverflow.com/a/21653600 — Google's "render?action=TEMPLATE"
// endpoint is undocumented but stable; it accepts text, dates, details, location.
function buildGoogleCalendarUrl(opts: {
  title: string;
  details: string;
  startIso: string;
  durationMinutes: number;
}) {
  const start = new Date(opts.startIso);
  const end = new Date(start.getTime() + opts.durationMinutes * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.details,
    location: "Zoom",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function HomeLaunchEvent() {
  const t = useTranslations("HomeLaunchEvent");

  const eventDetails = buildEventDetails({
    description: t("calendarDescription"),
    url: LAUNCH_EVENT.registrationUrl,
    meetingId: LAUNCH_EVENT.meetingId,
    registerLabel: t("calendarRegisterLabel"),
    meetingIdLabel: t("calendarMeetingIdLabel"),
  });

  const icsHref = buildIcsDataUri({
    title: t("calendarTitle"),
    details: eventDetails,
    startIso: LAUNCH_EVENT.dateIso,
    durationMinutes: LAUNCH_EVENT.durationMinutes,
    url: LAUNCH_EVENT.registrationUrl,
  });

  const googleCalHref = buildGoogleCalendarUrl({
    title: t("calendarTitle"),
    details: eventDetails,
    startIso: LAUNCH_EVENT.dateIso,
    durationMinutes: LAUNCH_EVENT.durationMinutes,
  });

  const shareCopyText = t("shareCopyText", {
    registrationUrl: LAUNCH_EVENT.registrationUrl,
    meetingId: LAUNCH_EVENT.meetingId,
  });

  const stats: Array<{
    icon: React.ReactElement;
    label: string;
    value: string;
  }> = [
    { icon: CAL_ICON, label: t("dateLabel"), value: t("dateValue") },
    { icon: CLOCK_ICON, label: t("timeLabel"), value: t("timeValue") },
    {
      icon: HOURGLASS_ICON,
      label: t("durationLabel"),
      value: t("durationValue"),
    },
    { icon: CAMERA_ICON, label: t("whereLabel"), value: t("whereValue") },
  ];

  return (
    <section className="px-0 py-10 sm:py-14">
      <article className="relative mx-auto max-w-[1000px] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] p-6 backdrop-blur-md sm:p-9">
        {/* Pill */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(230_57_70_/_0.32)] bg-[rgb(230_57_70_/_0.12)] px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
          />
          {t("pill")}
        </span>

        {/* Heading + body */}
        <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.05] font-extrabold tracking-[-0.015em] text-fg">
          {t("heading")}
        </h2>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-fg-dim sm:text-base">
          {t("body")}
        </p>

        {/* 4 data cards */}
        <dl className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-line bg-[rgb(11_8_6_/_0.55)] px-4 py-3"
            >
              <dt className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-fg-mute uppercase">
                <span className="text-accent">{stat.icon}</span>
                {stat.label}
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-fg">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* CTA + reassurance */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <a
            href={LAUNCH_EVENT.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1612] no-underline shadow-sm transition-colors hover:bg-[rgb(255_255_255_/_0.92)]"
          >
            <span className="text-accent">{TICKET_ICON}</span>
            {t("cta")}
            <span className="text-fg-mute">{ARROW_ICON}</span>
          </a>
          <p className="text-[13px] leading-[1.5] text-fg-mute">
            {t("freeCaption")}
          </p>
        </div>

        {/* Tertiary actions */}
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-[13px]">
          <a
            href={icsHref}
            download="wc2026-launch.ics"
            className="inline-flex items-center gap-1.5 text-fg-dim no-underline transition-colors hover:text-fg"
          >
            <span className="text-fg-mute">{CAL_ICON}</span>
            {t("addToCalendar")}
          </a>
          <a
            href={googleCalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-fg-dim no-underline transition-colors hover:text-fg"
          >
            <span className="text-fg-mute">{CAL_ICON}</span>
            {t("googleCalendar")}
          </a>
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-fg-dim no-underline transition-colors hover:text-fg"
          >
            <span className="text-fg-mute">{EXT_ICON}</span>
            {t("toolkitLink")}
          </Link>
          <ShareButton
            text={shareCopyText}
            shareLabel={t("shareLink")}
            copiedLabel={t("shareCopiedFeedback")}
            icon={SHARE_ICON}
          />
        </div>
      </article>
    </section>
  );
}
