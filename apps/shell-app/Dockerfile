# Build context for this Dockerfile must be the repo root (not apps/shell-app/),
# since `turbo prune` needs to see the whole workspace to find shell-app's deps.

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
RUN npm install -g turbo@^2.10.12
WORKDIR /app

# Extracts just shell-app + the workspace packages it actually depends on
# (packages/rx-engine, packages/store, packages/ui-components), discarding
# pricing-mfe and blotter-mfe entirely.
FROM base AS prune
COPY . .
RUN turbo prune shell-app --docker

# Installing from out/json first means this layer only re-runs when shell-app's
# (or its deps') actual dependencies change, not on every source edit.
FROM base AS build
COPY --from=prune /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
# turbo prune only copies each workspace package's own files, not loose root
# config files reached via relative "extends" paths — tsconfig.base.json falls
# into that gap, so it needs pulling in from the original build context here.
COPY tsconfig.base.json .
# import.meta.env.VITE_* is inlined into the JS bundle at build time, so these
# must be real env vars before the build runs, not left as runtime config.
ARG VITE_PRICING_MFE_URL
ARG VITE_BLOTTER_MFE_URL
ENV VITE_PRICING_MFE_URL=$VITE_PRICING_MFE_URL \
    VITE_BLOTTER_MFE_URL=$VITE_BLOTTER_MFE_URL
RUN turbo run build --filter=shell-app

# No Node runtime shipped in the final image — just the static output.
FROM nginx:alpine
COPY --from=build /app/apps/shell-app/dist /usr/share/nginx/html
EXPOSE 80
