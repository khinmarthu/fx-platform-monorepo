# Build context for this Dockerfile must be the repo root (not apps/pricing-mfe/),
# since `turbo prune` needs to see the whole workspace to find pricing-mfe's deps.

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN npm install -g turbo@^2.10.12
WORKDIR /app

# Extracts just pricing-mfe + the workspace packages it actually depends on
# (packages/rx-engine, packages/ui-components), discarding shell-app and
# blotter-mfe entirely.
FROM base AS prune
COPY . .
RUN turbo prune @fx-platform/pricing-mfe --docker

# Installing from out/json first means this layer only re-runs when
# pricing-mfe's (or its deps') actual dependencies change, not on every
# source edit.
FROM base AS build
COPY --from=prune /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
# turbo prune only copies each workspace package's own files, not loose root
# config files reached via relative "extends" paths — tsconfig.base.json falls
# into that gap, so it needs pulling in from the original build context here.
COPY tsconfig.base.json .
# import.meta.env.VITE_* is inlined into the JS bundle at build time, so this
# must be a real env var before the build runs, not left as runtime config.
ARG VITE_WS_URL
ENV VITE_WS_URL=$VITE_WS_URL
RUN turbo run build --filter=@fx-platform/pricing-mfe

# No Node runtime shipped in the final image — just the static output.
# Copied under /pricing to match the /pricing/ base path baked into the build,
# so the gateway's path-preserving proxy_pass resolves correctly.
FROM nginx:alpine
# Removes nginx's own stock "Welcome to nginx!" page, which otherwise stays
# reachable at / since we only copy our files into the /pricing subfolder.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/apps/pricing-mfe/dist /usr/share/nginx/html/pricing
EXPOSE 80
