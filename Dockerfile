FROM node:20-bookworm-slim AS base
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile=false --prod=false
RUN pnpm prisma:generate

COPY . .

RUN SKIP_ENV_VALIDATION=1 pnpm build

EXPOSE 3000

CMD ["pnpm","start"]
