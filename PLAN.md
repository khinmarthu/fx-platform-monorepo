# FX Trading Platform Monorepo Architecture & Implementation Plan

A high-performance enterprise FX Trading showcasing a **3-Micro-Frontend (MFE)** architecture built with **pnpm Workspaces**, **Turborepo**, **RxJS backpressure streaming**, and **Redux Toolkit normalized state**.

---

## Architecture Blueprint

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ 1. SHELL MFE (`apps/shell-app`)                                             │
    │    - Navigation Header, Layout Grid, Auth Token Context, Theme Switching    │
    │    - Renders Feature MFE Modules                                            │
    └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                ┌──────────────────────────┴──────────────────────────┐
                ▼                                                     ▼
    ┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
    │ 2. LIVE PRICING MFE                  │  │ 3. TRADE HISTORY BLOTTER MFE     │
    │    (`apps/pricing-mfe`)              │  │    (`apps/blotter-mfe`)          │
    │                                      │  │                                  │
    │ - Pattern: Micro-Subscription        │  │ - Pattern: Master Stream Sub     │
    │ - State: Direct RxJS to View Cell    │  │ - State: Local Redux Toolkit     │
    │ - Focus: 60fps Rate Grid             │  │ - Focus: Audit Log, Search, O(1) │
    └───────────────────┬──────────────────┘  └───────────────────▲──────────────┘
                        │                                         │
                        │      Publishes Trade Executions         │
                        └────────────► ┌──────────────────┐ ──────┘
                                    │  SHARED RXJS     │
                                    │  EVENT BUS /     │
                                    │  STREAM ENGINE   │
                                    │  (`rx-engine`)   │
                                    └──────────────────┘

---

## Master TODO List

### Phase 1: Workspace Scaffolding & Root Configuration

- [x] Initialize `fx-platform-monorepo` root directory.
- [x] Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`.
- [x] Create `turbo.json` defining build pipeline (`build`, `dev`, `lint`).
- [x] Create root `package.json` with scripts and Turborepo dependency.
- [x] Create `tsconfig.base.json` for shared TypeScript configurations.

### Phase 2: Shared Workspace Packages (`packages/`)

- [ ] **`packages/rx-engine`**
  - [x] Configure `package.json` with package name `@fx-platform/rx-engine`.
  - [x] Implement Web Worker `fxWorker.ts` (JSON parser off-main-thread).
  - [x] Add local WebSocket server in`scripts/mock-ws-server.ts` and add new script `mock:ws` in package.json
  - [x] Implement the bridge that connects Worker messages to React components: `FXStreamService.ts` (Master RxJS `Subject` + `sampleTime(16)` backpressure).
  - [x] Implement Event Bus for cross-MFE trade execution messages.
  - [x] Add test script `scripts/test-rx-engine.ts` and add new script `test:rx` in package.json to test rx-engine
  - [x] Export public API through `index.ts`.
  - [x] Re-export key RxJS utilities to enforce zero direct `rxjs` dependency in MFEs
- [x] **`packages/store`**
  - [x] Configure `package.json` with package name `@fx-platform/store` and `tsconfig.json`.
  - [x] Define shared TypeScript interfaces (`types.ts`: `TickData`, `TradeOrder`, `TradeStatus`).
  - [x] Implement normalized `tradeSlice.ts` using `createEntityAdapter<TradeOrder, string>`
  - [x] Export slice actions, entity selectors, and named `tradeReducer` (`index.ts`)
- [x] **`packages/ui-components`**
  - [x] Configure `package.json` with React `peerDependencies` contract
  - [x] Implement hybrid `TradeButton` (`forwardRef` for direct DOM mutations & optional prop fallback)
  - [x] Implement `StatusBadge` component
  - [x] Export public entrypoints (`index.ts`) and compile TypeScript dist

### Phase 3: Application Development (`apps/`)

- [x] **`apps/pricing-mfe`**: (Live rate grid micro-subscribing to `FXStreamService`)
  - [x] Implement custom `useDirectFXStream` hook with auto-unsubscribe via `takeUntil` for zero-VDOM direct DOM updates
  - [x] Implement high-frequency `<PricingTile />`components (Direct RxJS-to-DOM) using hybrid `TradeButton` with ref forwarding
  - [x] Integrate trade execution emitting events onto cross-MFE `EventBus`

- [x] **`apps/blotter-mfe` (Trade History)**
  - [x] Wire dependencies `@fx-platform/rx-engine`, `@fx-platform/store`, and `@fx-platform/ui-components`.
  - [x] Set up local Redux store consuming `tradeReducer` from `@fx-platform/store`.
  - [x] Implement `EventBus` subscription listening to `ORDER_EXECUTED` trade events via `eventBus.onEvent()`.
  - [x] Build `<BlotterTable />` rendering trade executions from Redux state using `selectAllBlotterTrades`.

- [x] **`apps/shell-app` (Shell MFE)**
  - [x] Initialize `apps/shell-app` host container on Port 3000 with `@module-federation/vite`.
  - [x] Configure remote entry orchestration (`pricing_mfe` and `blotter_mfe`).
  - [x] Implement async module unwrap helper in `React.lazy` to resolve Module Federation dynamic bundles.
  - [x] Establish hybrid type safety strategy using ambient declarations (`remotes.d.ts`) alongside `@mf-types`.
  - [x] Verify end-to-end local FX trading rendering and cross-MFE component composition.

### Phase 4: Documentation & Production Build
- [x] Document architecture and setup instructions.
- [x] Verify full workspace `pnpm build` and local `pnpm preview` execution across all 3 apps.
- [ ] Finalize CI/CD pipeline and containerized deployment strategy.
  - [x] Per-app `Dockerfile`s (shell-app, pricing-mfe, blotter-mfe) — multi-stage
    build using `turbo prune` per app, final stage serves static output via
    `nginx:alpine`. Each builds and verified independently (see README §4).
  - [x] Gateway `nginx.conf` (path-based proxy: `/` → shell, `/pricing/` →
    pricing, `/blotter/` → blotter, WS upgrade → mock-ws-server).
  - [x] `mock-ws-server` Dockerfile — verified accepting WS connections and
    streaming ticks.
  - [x] `docker-compose.yml` wiring all 5 services together — verified
    end-to-end locally (see README §4): all routes 200, WS upgrade proxies
    correctly through the gateway to `mock-ws-server`.
  - [ ] Deploy to a GCP `e2-micro` VM (Always Free tier) with real nginx.

### Phase 5: Benchmarking, Documentation & Portfolio Readies
- [ ] Verify 60fps performance without main thread blocking.
- [ ] Verify zero memory leaks on component unmounting.
- [ ] Create GitHub `README.md` with architecture diagrams and performance benchmarks.
