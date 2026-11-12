FROM node:22.23.5-bookworm-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee

WORKDIR /app
COPY scripts/update-security-ca.sh ./scripts/update-security-ca.sh
RUN sh scripts/update-security-ca.sh
ENV SSL_CERT_DIR=/usr/local/share/security-ca/certs
RUN npm install --global pnpm@10.34.7 --no-audit --no-fund
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN HUSKY=0 pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV NODE_ENV=production
CMD ["pnpm", "start"]
