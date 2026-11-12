# November Node 22 security repair

## Scope and decision

Keep the supported Node 22 major and Debian Bookworm image. The official
November advisory and current release index select 22.23.5. The verified official
multi-platform image index is
`sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee`.

Synchronize `Dockerfile`, `.nvmrc`, `package.json` engines,
`.github/workflows/ci.yml`, `.devcontainer/Dockerfile` and
`scripts/verify-security-image.mjs`. Preserve the frozen dependency graph,
filtered CA store, standalone startup and current-default security fixes.
The pnpm v9 lock has no root Node engine metadata requiring an edit.
Historical plans describe their original pins and remain historical.

## Implementation and validation

1. Refresh default, paginated PR inventory, reviews, rules, checks and deliveries;
   use a fresh isolated clone and a dedicated repair branch.
2. Apply the six synchronized replacements without dependency resolution churn.
3. Run frozen install and all five quality gates under verified Node 22.23.5,
   plus installed engine contracts and a synthetic Sharp native operation.
4. Build the actual application Dockerfile at the repaired commit, retaining
   public font downloads. Deny production application API hosts during build;
   use synthetic local data and network guards for serving. Run in-image tests,
   exact Node/OpenSSL/pnpm trust verification, and English/Arabic/static serving.
5. Review the entire diff, lock identity, source usage and upstream contracts.
   Record exact commit/tree and failures in external repair evidence.
6. Recheck default, PRs and App permissions before publication. If workflow
   permission is absent, retain the complete tested commit and patch locally.
   Independent review, green required Quality Gates/image checks and normal
   coordinator integration remain required; no merge or deployment is authorized.

No product behavior or translations change. Deployment executable/image identity
and runner-owned embedded Node runtimes remain separate operational evidence.
