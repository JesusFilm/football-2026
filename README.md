# Football 2026

Modern Next.js foundation for the Football 2026 project.

## Development

```bash
pnpm install
pnpm dev
```

## Quality Gates

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

Pre-commit hooks run `lint-staged`, which formats staged files and applies
ESLint fixes to staged JavaScript and TypeScript.
