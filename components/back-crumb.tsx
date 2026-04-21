import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

export function BackCrumb({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[20px] border border-line px-[14px] py-2 font-mono text-[11px] tracking-[0.1em] text-fg-dim uppercase no-underline transition-colors hover:border-line-strong hover:text-fg"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M7 3L4 6l3 3" />
      </svg>
      {label}
    </Link>
  );
}
