FROM node:22.23.4-bookworm-slim@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d

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
