# Turbopack Google font query failures

`Module not found` for `@vercel/turbopack-next/internal/font/google/font`
with `next/font/google queries have exactly one entry` can indicate an upstream
URL parser defect rather than a missing dependency or a TLS failure. Next.js
16.4.2 parses serialized font options as a query string. A Google font URL
containing `&` splits that JSON into multiple entries; extensionless font URLs
also need a type inferred from CSS.

Next.js 16.4.3 backports upstream fix #100277: encode the whole JSON as one
query entry and infer the font type. Preserve the existing `next/font/google`
configuration and use the supported patch instead of suppressing font downloads,
changing fonts, disabling TLS verification or bypassing the production build.
The same parser failure was present on the default branch before the Node
22.23.5 update. A successful image build with ordinary Google responses does
not exercise the alternate URL shape.

For regression evidence, serve a real WOFF2 fixture locally with an extensionless
URL containing percent escapes, equals and ampersands, following upstream's
fixture. Verify the old compiler fails and the patched compiler preserves the
request URL and emitted font bytes. Keep that synthetic check separate from
the actual application build, which must still download real public fonts.

Targeted pnpm resolution can refresh unrelated `latest` declarations. Compare
the entire lock, retain their original resolutions and peer snapshots, then
verify a frozen install. See also
[bounded tooling updates](2026-10-17-bounded-tooling-lock-updates.md).
