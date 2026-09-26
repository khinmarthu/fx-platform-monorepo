# Build context for this Dockerfile must be the repo root, so it can reach
# scripts/mock-ws-server.ts.
#
# No turbo prune here, unlike the 3 app Dockerfiles: this script isn't a
# turbo workspace package (it has no package.json of its own, isn't listed
# in pnpm-workspace.yaml, and doesn't appear in turbo.json's task graph) —
# it only imports the "ws" npm package, a root-level devDependency with no
# workspace deps to prune in the first place. Just copy the one file it needs.
FROM node:22-slim
WORKDIR /app
COPY scripts/mock-ws-server.ts ./
# Versions pinned to match root package.json's devDependencies.
RUN npm install ws@8.21.3 tsx@4.23.12
EXPOSE 8080
CMD ["npx", "tsx", "mock-ws-server.ts"]
