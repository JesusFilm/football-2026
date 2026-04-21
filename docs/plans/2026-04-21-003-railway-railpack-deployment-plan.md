---
title: "chore: Railway Railpack Deployment"
type: chore
status: active
date: 2026-04-21
origin: user request
---

# chore: Railway Railpack Deployment

## Overview

Prepare the root Next.js app for a new Railway deployment that uses Railpack. The app is already shaped well for Railway: it lives at the repository root, uses `pnpm@10.33.0`, has `pnpm build` and `pnpm start`, and has no existing Dockerfile, Nixpacks, or Railway config competing for builder selection.

The plan is intentionally small: make Next emit a standalone production server, add config-as-code that explicitly selects Railpack, verify the production build locally, then create a Railway project and connect/deploy the repo from Railway.

## Problem Frame

Railway now uses Railpack as its default builder for new services, but Next.js self-hosting still needs the app to produce a runnable standalone server. Railway's current Next.js guide says to add `output: "standalone"` and update the start script to serve `.next/standalone/server.js`; Railway's config-as-code reference says `railway.json` can set the builder, build command, start command, healthcheck, and restart policy for each deployment.

## Requirements Trace

- Create a new Railway project for this app.
- Deploy using Railpack, not a Dockerfile or legacy builder path.
- Keep package management on `pnpm`; do not introduce npm, Yarn, or Bun lockfiles.
- Keep the app deployable from the repository root.
- Preserve local development with `pnpm dev`.
- Verify the repo's standard quality gate before handoff.

## Scope Boundaries

- No database, queues, storage volumes, or runtime environment variables are required for the current app.
- No Dockerfile will be added; a Dockerfile would make Railway build with Dockerfile instead of Railpack.
- No monorepo root-directory configuration is needed because the active app is at the repository root.
- Public domain generation and custom domain setup are Railway service settings, not repo code. They should be completed after the first successful deploy.

## Context & Research

- `package.json` already has `build`, `start`, `lint`, `format:check`, `typecheck`, `test:run`, and `build` scripts, matching the repo quality gate in `AGENTS.md`.
- `next.config.ts` currently only enables `reactStrictMode`; adding `output: "standalone"` is the only Next config change needed.
- Railway project target:
  - Active project: `football-2026` in `Jesus Film Project`
  - Project ID: `12fee123-9623-4f4d-8889-9f6ad16e1fb0`
  - Production environment ID: `00cd838e-bd95-4f5f-8e3e-915c9b586b03`
  - Workspace ID: `6c6be4fe-43f0-4651-b491-16c83fa2afba`
  - Service: `victorious-acceptance`
  - Service ID: `1cad2973-17fe-4253-bd15-4aaf7c38d53a`
  - Mistaken empty project still requiring dashboard deletion: `0ee13888-7b2c-40ec-989a-65e021f6021d` in `Ev Church`
- Railway docs checked on 2026-04-21:
  - `docs.railway.com/guides/nextjs` says standalone output is needed for self-hosted Next.js and that Railpack detects the start script.
  - `docs.railway.com/config-as-code/reference` says `railway.json` can specify `build.builder: "RAILPACK"` and deploy settings.
  - `docs.railway.com/builds/build-configuration` says Railway uses Railpack to build code and supports custom build/install/start configuration when needed.

## Key Decisions

- **Use `output: "standalone"` in `next.config.ts`.** This follows Railway's current Next.js guidance and produces `.next/standalone/server.js`.
- **Use `pnpm start` as Railway's configured start command.** Keeping Railway pointed at the package script keeps the runtime command discoverable and makes future changes happen in one familiar place.
- **Add `railway.json` with `builder: "RAILPACK"`.** Railpack is the default for new services, but explicit config-as-code prevents ambiguity and documents intent in the repo.
- **Set `healthcheckPath: "/"`.** The home page is static enough to serve as a first-pass deployment healthcheck.
- **Create the project before triggering a deploy, but wait for workspace/project-name confirmation if multiple workspaces are available.** The connected Railway account has access to multiple workspaces, so this is the one piece that should not be guessed.

## Implementation Units

### Unit 1: Repo Runtime Config

Files:

- `next.config.ts`
- `package.json`
- `railway.json`

Work:

- Add `output: "standalone"` to Next config.
- Change `start` to `node .next/standalone/server.js`.
- Add `railway.json` that selects Railpack, runs `pnpm build`, starts with `pnpm start`, and healthchecks `/`.

Tests:

- `pnpm build` confirms standalone output is produced.
- `PORT=3000 pnpm start` can serve the built app locally if a runtime smoke check is needed.

### Unit 2: Quality Gate

Commands:

- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test:run`
- `pnpm build`

Success:

- All commands pass, or any failure is documented with the exact command and relevant error.

### Unit 3: Railway Project Setup

Railway actions:

- Create a new project named `football-2026` unless the user chooses a different name.
- Use the intended workspace selected by the user.
- Add a web service from the GitHub repository or use Railway's project agent if available to connect the repo.
- Confirm the service uses the repository root and Railpack.
- Trigger the first deployment only after project/service settings are staged intentionally.

Success:

- Railway project exists.
- Web service is configured to deploy this repo with Railpack.
- Deployment logs show Railpack running `pnpm build` and the service starting with `pnpm start`.

### Unit 4: Public URL

Railway actions:

- Generate a Railway domain after the first successful deploy.
- Verify `/`, `/robots.txt`, and `/sitemap.xml` respond successfully on the public URL.

Success:

- A live Railway URL is available.
- Basic route checks pass.

## Risks

- **Workspace ambiguity:** the authenticated Railway user can create projects in multiple workspaces. Creating in the wrong workspace is easy to avoid by confirming first.
- **Service connection limits:** the available Railway MCP tools can create projects and ask Railway's agent to configure services, but the exact GitHub service-connection flow may still require dashboard interaction if OAuth repo selection is not exposed to the tool.
- **Next standalone runtime differences:** the start script explicitly sets `HOSTNAME=0.0.0.0` so the standalone server binds to the container interface Railway expects.

## Handoff Checklist

- [x] Repo config patched.
- [x] Quality gate passes.
- [x] Railway workspace confirmed.
- [x] Project created.
- [x] Service connected to repo.
- [ ] First deployment active.
- [ ] Railway domain generated and smoke-tested.
