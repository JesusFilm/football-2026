# Compatible tooling dependency update

## Scope

Update Playwright from 1.59.1 to 1.64.1 and ESLint from 9.39.4 to 9.39.5 in one bounded lockfile repair. This is a proposed replacement for the dependency intent of PRs #24 and #25; those PRs remain open for coordinator review.

## Implementation

1. Start from the verified default branch and inspect both complete bot lockfiles.
2. Preserve the existing Testing Library, React, Node typing, and Vite plugin resolutions. Updating the two tooling packages must not refresh unrelated `latest` declarations.
3. Retain ESLint's required `@eslint/eslintrc` and `@eslint/js` updates, including `js-yaml` 4.3.2 security fixes. Remove the obsolete Playwright-only `fsevents` 2.3.2 entry.
4. Verify frozen installation, actual installed versions, dependency and peer ranges, Node 22 engines, full-graph native audit, and OSV package/version queries.
5. Run all repository quality gates and isolated synthetic compatibility probes. Keep qualification fixtures and logs outside the repository.

## Compatibility review

The app uses Vitest and React's automatic JSX runtime. It has no Playwright configuration, imports, snapshot assertions, device descriptors, Electron integrations, or component testing packages. Playwright 1.60's removed deprecated APIs and 1.64's changes to descriptor screen dimensions, JSX compilation, missing snapshots, and hidden iframe visibility therefore do not change an existing test contract. Synthetic probes exercise automatic JSX, descriptor screen/viewport behavior, explicit viewport dimensions, hidden iframe visibility, browser actions, screenshots, and video recording. Node 22 in CI and the Ubuntu 24.04 devcontainer meet Playwright's Node >=20 floor and supported OS requirements.

ESLint's patch handles unavailable require caches and updates companion dependencies. The YAML update adds parsing limits and changes underscored numeric scalars to strings; this app has no runtime `js-yaml` use or legacy YAML ESLint config. The repository's Next.js flat config and TypeScript rules remain in place. ESLint 9 is deprecated upstream; a future major migration is separate work.

Primary references: [Playwright releases](https://github.com/microsoft/playwright/releases), [Playwright 1.64.0](https://github.com/microsoft/playwright/releases/tag/v1.64.0), [Playwright 1.64.1](https://github.com/microsoft/playwright/releases/tag/v1.64.1), [ESLint 9.39.5](https://github.com/eslint/eslint/releases/tag/v9.39.5).

## Qualification boundaries

Use synthetic fixtures with no credentials and an isolated network namespace with loopback enabled for application commands. Published browser binaries and font files may be downloaded separately into the owned qualification directory. Supply the published font files through a loopback font server and Next's offline font-response hook for the isolated production build. Do not start the application or contact production APIs. Preserve the initial offline font-fetch failure in the external evidence.

Remaining baseline audit findings are separate security work. This update must introduce no findings and must retain the `js-yaml` fixes already present in the ESLint bot proposal. Do not modify CI, infrastructure, protections, or unrelated application behavior.
