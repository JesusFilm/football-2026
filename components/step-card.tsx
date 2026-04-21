import type { LucideIcon } from "lucide-react";

type Props = {
  num: string;
  title: string;
  body: string;
  icon?: LucideIcon;
  titleLevel?: "h2" | "h3";
};

export function StepCard({
  num,
  title,
  body,
  icon: Icon,
  titleLevel = "h2",
}: Props) {
  const Title = titleLevel;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.55)] px-5 py-[18px] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] tracking-[0.15em] text-accent">
          {num}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-[rgb(255_255_255_/_0.04)] text-fg-dim">
            <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
          </div>
        )}
      </div>
      <Title className="mb-1 text-[15px] font-semibold">{title}</Title>
      <p className="text-[13px] leading-[1.5] text-fg-dim">{body}</p>
    </div>
  );
}
