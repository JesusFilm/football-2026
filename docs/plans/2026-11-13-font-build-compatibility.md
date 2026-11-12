# Google font build compatibility repair

The November Node security candidate fails hosted Quality Gates in the Next.js
16.4.2 Turbopack Google font query parser. The exact candidate image builds,
while the hosted run has no restored Next cache. Node selectors are the only
application execution change from the default branch.

Use Next.js 16.4.3, the first stable patch with upstream fix #100277 for
extensionless Google font URLs and complete query encoding. Keep the existing
fonts, weights, subsets, preload behavior, Node 22.23.5 and image digest, CA
filtering, checks and deployment configuration. Retain unrelated locked versions;
review the complete Next/env/SWC dependency closure and existing peer contracts.

Validate the upstream regression against the old and patched font loaders,
then run frozen installation, lint, formatting, types, tests with at most two
workers, and the native production build. Build the actual application image
and verify runtime version, native Sharp, CA rejection with valid controls,
tests and English/Arabic/static serving. Use synthetic application API data
for local serving and preserve real public font downloads for production builds.

Refresh remote default/head and writers before a normal fast-forward update to
the existing PR. Record exact source trees and hosted check operations. The
coordinator owns integration and observation of normal automatic deployment.
