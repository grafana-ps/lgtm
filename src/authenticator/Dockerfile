FROM node:current-alpine3.22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml .
COPY ./src/lib ./src/lib
COPY ./src/authenticator ./src/authenticator

FROM base AS prod-deps
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "start-authenticator"]
