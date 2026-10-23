import assert from "node:assert/strict";

const origin = process.env.SECURITY_TEST_ORIGIN ?? "http://localhost:3000";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
let ready = false;
for (let attempt = 0; attempt < 90; attempt += 1) {
  try {
    const response = await fetch(origin, {
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    await response.body?.cancel();
    if ([200, 307, 308].includes(response.status)) {
      ready = true;
      break;
    }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
assert.ok(ready, "Production server must become ready");
const canonical = await fetch(`${origin}/en`, { redirect: "manual" });
assert.equal(canonical.status, 308);
assert.equal(new URL(canonical.headers.get("location"), origin).pathname, "/");
await canonical.body?.cancel();
const preferred = await fetch(origin, {
  headers: { "accept-language": "ar" },
  redirect: "manual",
});
assert.equal(preferred.status, 307);
assert.equal(
  new URL(preferred.headers.get("location"), origin).pathname,
  "/ar",
);
await preferred.body?.cancel();

for (const [locale, direction] of [
  ["en", "ltr"],
  ["ar", "rtl"],
]) {
  const response = await fetch(`${origin}/${locale}`, {
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`));
  assert.match(html, new RegExp(`dir="${direction}"`));
  const asset = html.match(/src="([^" ]*\/_next\/static\/[^" ]+\.js)"/);
  assert.ok(
    asset,
    "Rendered page must reference a production JavaScript asset",
  );
  const javascript = await fetch(new URL(asset[1], origin), {
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(javascript.status, 200);
  assert.match(javascript.headers.get("content-type"), /javascript/);
  await javascript.body?.cancel();
}
console.log(
  "PASS: production standalone server, English and Arabic direction, public pages and actual JavaScript assets",
);
