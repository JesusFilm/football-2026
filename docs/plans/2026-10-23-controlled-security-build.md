# Controlled runtime and build certificate trust

The current patched app still uses a managed builder whose initial Mise downloads precede application CA hooks. Build from the pinned official Node 22.23.4 image, filter the two distrusted roots before package operations, and install the existing pinned pnpm version with the frozen lockfile. Retain the existing standalone build and Railway deployment settings.

Use an explicit source allowlist for the image; exclude local environments, keys, Git state and caches. No production credential is needed for the dynamic route build. Existing GraphQL and Plausible configuration continues to come from runtime service variables.

Run all five existing quality gates. Hosted CI must build the actual image, check native Node, OpenSSL and installed pnpm rejection of both affected chains with valid controls, run the existing suite inside it, then check English/Arabic pages and static assets from the standalone server. Merge only after both existing and image checks pass. Verify exact current source/image, serving process, package/client TLS and public browser behavior after normal main autodeployment.

Rollback coordinates belong in the external audit tracker. A rollback to the old managed image reopens the build-trust finding. The scope adds no application feature, dependency update or authentication change.
