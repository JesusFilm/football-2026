"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/" as const, key: "home" as const, matchExact: true },
  { href: "/resources" as const, key: "resources" as const, matchExact: false },
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
            className="absolute end-4 top-[60px] z-20 flex w-[180px] flex-col gap-1 rounded-md border border-line bg-[rgb(20_16_12_/_0.92)] p-2 shadow-lg backdrop-blur-md"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href, item.matchExact);
              return (
                <Link
                  key={item.key}
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
