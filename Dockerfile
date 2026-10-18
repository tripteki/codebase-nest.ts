ARG BUN_VERSION=1

FROM oven/bun:${BUN_VERSION}-alpine AS base

RUN apk add --no-cache openssl

WORKDIR /app

FROM base AS deps

COPY package.json bun.lock ./
COPY src/app/databases/postgre.schema.prisma src/app/databases/mongo.schema.prisma ./src/app/databases/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS prod-deps

COPY package.json bun.lock ./
COPY src/app/databases/postgre.schema.prisma src/app/databases/mongo.schema.prisma ./src/app/databases/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

FROM deps AS build

COPY . .

RUN bun run build

FROM base AS runtime

ENV NODE_ENV=production \
    APP_HOST=0.0.0.0 \
    APP_PORT=8000

COPY --from=prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --chown=bun:bun package.json ./
COPY --chown=bun:bun public ./public
COPY --chown=bun:bun src/app/databases/postgre.schema.prisma src/app/databases/mongo.schema.prisma ./src/app/databases/
COPY --chown=bun:bun src/app/databases/migrations ./src/app/databases/migrations

RUN mkdir -p storage/disks/public storage/logs && chown -R bun:bun storage

USER bun

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO /dev/null "http://127.0.0.1:${APP_PORT}/api/status" || exit 1

CMD ["bun", "dist/main.js"]
