FROM node:current-alpine3.22 AS js-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml .
COPY ./src/lib ./src/lib

FROM js-base AS js-prod-deps
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM js-base
WORKDIR /app
COPY --from=js-prod-deps /app/node_modules ./node_modules
COPY ./src/load-generator ./src/load-generator
EXPOSE 3000
CMD ["pnpm", "start-load-generator"]
