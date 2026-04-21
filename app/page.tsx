import { StatusCard } from "@/components/status-card";

const checks = [
  {
    title: "Next.js 16",
    body: "App Router, React 19, strict TypeScript, and a small production-ready starter surface.",
  },
  {
    title: "Quality Gates",
    body: "ESLint, Prettier, typechecking, Vitest, and build checks all run locally and in CI.",
  },
  {
    title: "Fast Commits",
    body: "Husky and lint-staged keep staged changes tidy before they leave a developer machine.",
  },
  {
    title: "Agent Ready",
    body: "Repo instructions tell coding agents where to look, what to run, and how to stay efficient.",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Football 2026 · Engineering Foundation</p>
        <h1 id="home-title">A clean Next.js baseline is ready.</h1>
        <p>
          This repo now has the modern tooling foundation for building the
          Football 2026 experience: pnpm, Next.js, formatting, linting, tests,
          commit hooks, and CI.
        </p>
        <div className="check-grid" aria-label="Configured tooling">
          {checks.map((check) => (
            <StatusCard key={check.title} title={check.title}>
              {check.body}
            </StatusCard>
          ))}
        </div>
      </section>
    </main>
  );
}
