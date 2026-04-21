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
    <article className="px-2 py-2 text-center md:text-start">
      <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
        <div className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase">
          {num}
        </div>
        {Icon && (
          <Icon
            aria-hidden="true"
            className="text-fg-mute"
            size={15}
            strokeWidth={1.8}
          />
        )}
      </div>
      <Title className="mb-1 text-[15px] font-semibold">{title}</Title>
      <p className="text-[13px] leading-[1.5] text-fg-dim">{body}</p>
    </article>
  );
}
