import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center px-6 pt-6 pb-6 sm:px-10 sm:pt-8 sm:pb-8">
      <Link
        href="/"
        className="inline-flex items-center text-fg no-underline"
        aria-label="Jesus Film Project — home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/jfp-red.svg"
          alt="Jesus Film Project"
          width={186}
          height={47}
          className="h-8 w-auto sm:h-9"
        />
      </Link>
    </header>
  );
}
