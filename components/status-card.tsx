type StatusCardProps = {
  children: React.ReactNode;
  title: string;
};

export function StatusCard({ children, title }: StatusCardProps) {
  return (
    <article className="check-card">
      <strong>{title}</strong>
      <span>{children}</span>
    </article>
  );
}
