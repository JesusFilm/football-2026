# Runtime and certificate trust remediation

The serving runtime is patched through a Railway setting, but the repository has no durable Node pin and the independent OS TLS client still trusts the affected eMudhra chains.

Pin the existing Node 22 major to 22.23.4 in the application, version file and CI. Refresh OS roots before dependency installation and in the runtime image, then derive a hashed trust directory from the filtered bundle so stale inherited PEM links cannot restore either distrusted root. Preserve application routes, deployment commands and dependencies.

Run the repository quality gate and inspect the generated Railpack plan. Follow the normal reviewed release, measure the serving executable, test both affected endpoints and a valid HTTPS control through Node and the OS client, then smoke the public site. Treat the initial Mise bootstrap as a separate build trust verification item.

Retain the prior deployment coordinates for rollback. Reverting to an image with the old trust store reopens the security finding.
