# Build context for this Dockerfile must be the repo root (not apps/blotter-mfe/),
# since `turbo prune` needs to see the whole workspace to find blotter-mfe's deps.

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN npm install -g turbo@^2.10.12
WORKDIR /app

# Extracts just blotter-mfe + the workspace packages it actually depends on
# (packages/rx-engine, packages/store, packages/ui-components), discarding
# shell-app and pricing-mfe entirely.
FROM base AS prune
COPY . .
RUN turbo prune @fx-platform/blotter-mfe --docker

# Installing from out/json first means this layer only re-runs when
# blotter-mfe's (or its deps') actual dependencies change, not on every
# source edit.
FROM base AS build
COPY --from=prune /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
# turbo prune only copies each workspace package's own files, not loose root
# config files reached via relative "extends" paths — tsconfig.base.json falls
# into that gap, so it needs pulling in from the original build context here.
COPY tsconfig.base.json .
RUN turbo run build --filter=@fx-platform/blotter-mfe

# No Node runtime shipped in the final image — just the static output.
# Copied under /blotter to match the /blotter/ base path baked into the build,
# so the gateway's path-preserving proxy_pass resolves correctly.
FROM nginx:alpine
# Removes nginx's own stock "Welcome to nginx!" page, which otherwise stays
# reachable at / since we only copy our files into the /blotter subfolder.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/apps/blotter-mfe/dist /usr/share/nginx/html/blotter
EXPOSE 80
