# Preserve unrelated dependency contracts during tooling updates

A targeted pnpm update can refresh unrelated direct dependencies declared as `latest`. In this repository, the ESLint and Playwright bot locks also moved Testing Library's matcher package across a major version and changed Node/Undici typing majors. Those resolutions require their own compatibility review.

For a bounded repair, inspect complete package and snapshot differences against the default branch. Retain the tooling packages' required companion updates and security fixes, preserve unrelated resolutions, and rebind every affected peer snapshot consistently. A successful frozen install alone is insufficient: verify actual installed versions and dependency, peer, and engine ranges against the lock.

ESLint 9.39.5 requires newer `@eslint/eslintrc`; its compatible `js-yaml` 4.3.2 dependency also removes four baseline advisories. Retaining that security update is part of the complete closure. Existing audit findings outside the closure remain explicit follow-up work.

See the [qualification plan](../plans/2026-10-17-tooling-dependency-qualification.md) for the scope and test boundaries. Do not reproduce external test harnesses as baseline CI or dummy repository tests.
