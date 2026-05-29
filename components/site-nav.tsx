"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { RESOURCE_SECTIONS } from "@/lib/resources-sections";

const NAV_ITEMS = [
  { href: "/" as const, key: "home" as const, matchExact: true },
  {
    href: "/resources" as const,
    key: "resources" as const,
    matchExact: false,
  },
];

function isActive(
  pathname: string,
  href: "/" | "/resources",
  matchExact: boolean,
): boolean {
  if (matchExact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const t = useTranslations("Header");
  const navT = useTranslations("ResourcesSectionNav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Desktop / tablet — visible from sm */}
      <nav
        aria-label={t("menuLabel")}
        className="hidden items-center gap-7 sm:flex"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.matchExact);

          if (item.key === "resources") {
            return (
              <div
                key={item.key}
                className="group/resources relative"
                onMouseLeave={(event) => {
                  // Force-close after pointer leaves; CSS handles open
                  (event.currentTarget as HTMLElement).blur();
                }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-haspopup="menu"
                  className={[
                    "relative inline-flex items-center gap-1 text-[14px] font-semibold no-underline transition-colors",
                    active ? "text-fg" : "text-fg-dim hover:text-fg",
                    "after:absolute after:bottom-[-6px] after:start-0 after:h-[2px] after:w-full after:rounded-full after:bg-accent after:transition-opacity",
                    active ? "after:opacity-100" : "after:opacity-0",
                  ].join(" ")}
                >
                  {t(item.key)}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover/resources:rotate-180 group-focus-within/resources:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </Link>

                <div
                  role="menu"
                  aria-label={navT("menuLabel")}
                  className="invisible absolute top-full left-1/2 z-30 mt-3 min-w-[260px] -translate-x-1/2 rounded-[var(--radius-md)] border border-line bg-[rgb(20_16_12_/_0.96)] py-2 opacity-0 shadow-2xl backdrop-blur-md transition-opacity duration-150 group-hover/resources:visible group-hover/resources:opacity-100 group-focus-within/resources:visible group-focus-within/resources:opacity-100"
                >
                  <span className="block px-4 pt-1 pb-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-fg/50 uppercase">
                    {navT("menuLabel")}
                  </span>
                  {RESOURCE_SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`/resources#${section.anchor}`}
                      role="menuitem"
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px] font-medium text-fg no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.12)] hover:text-white"
                    >
                      {navT(`items.${section.id}` as const)}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        className="rtl-mirror text-fg/50"
                        aria-hidden="true"
                      >
                        <path d="M3 7h8M8 3l4 4-4 4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "relative text-[14px] font-semibold no-underline transition-colors",
                active ? "text-fg" : "text-fg-dim hover:text-fg",
                "after:absolute after:bottom-[-6px] after:start-0 after:h-[2px] after:w-full after:rounded-full after:bg-accent after:transition-opacity",
                active ? "after:opacity-100" : "after:opacity-0",
              ].join(" ")}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Mobile — visible below sm */}
      <div className="sm:hidden">
        <button
          type="button"
          aria-label={isOpen ? t("menuCloseLabel") : t("menuOpenLabel")}
          aria-expanded={isOpen}
          aria-controls="site-nav-mobile-panel"
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-[rgb(20_16_12_/_0.6)] text-fg backdrop-blur-md transition-colors hover:border-[rgb(230_57_70_/_0.42)]"
        >
          {isOpen ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>

        {isOpen && (
          <div
            id="site-nav-mobile-panel"
            className="absolute end-4 top-[60px] z-20 flex w-[220px] flex-col gap-1 rounded-md border border-line bg-[rgb(20_16_12_/_0.92)] p-2 shadow-lg backdrop-blur-md"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href, item.matchExact);
              return (
                <div key={item.key} className="flex flex-col">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    className={[
                      "rounded px-3 py-2 text-[14px] font-medium no-underline transition-colors",
                      active
                        ? "bg-[rgb(230_57_70_/_0.18)] text-fg"
                        : "text-fg-dim hover:bg-[rgb(255_255_255_/_0.04)] hover:text-fg",
                    ].join(" ")}
                  >
                    {t(item.key)}
                  </Link>
                  {item.key === "resources" && (
                    <div className="mt-1 flex flex-col gap-px border-l border-line/40 ps-3">
                      {RESOURCE_SECTIONS.map((section) => (
                        <a
                          key={section.id}
                          href={`/resources#${section.anchor}`}
                          onClick={closeMenu}
                          className="rounded px-3 py-1.5 text-[13px] text-fg-dim no-underline transition-colors hover:bg-[rgb(255_255_255_/_0.04)] hover:text-fg"
                        >
                          {navT(`items.${section.id}` as const)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
