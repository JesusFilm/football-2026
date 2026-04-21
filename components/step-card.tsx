type Props = {
  num: string;
  title: string;
  body: string;
};

export function StepCard({ num, title, body }: Props) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.55)] px-5 py-[18px] backdrop-blur-xl">
      <div className="mb-2 font-mono text-[10px] tracking-[0.15em] text-accent">
        {num}
      </div>
      <h3 className="mb-1 text-[15px] font-semibold">{title}</h3>
      <p className="text-[13px] leading-[1.5] text-fg-dim">{body}</p>
    </div>
  );
}
