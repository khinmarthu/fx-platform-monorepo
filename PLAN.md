# FX Trading Platform Monorepo Architecture & Implementation Plan

A high-performance enterprise FX Trading Workstation showcasing a **3-Micro-Frontend (MFE)** architecture built with **pnpm Workspaces**, **Turborepo**, **RxJS backpressure streaming**, and **Redux Toolkit normalized state**.

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

- [ ] **`apps/shell-app` (Shell MFE)**
  - [ ] Build workspace layout frame, top navigation bar, and user status header.
  - [ ] Render and layout `<PricingMFE />` and `<BlotterMFE />` in a split workstation view.

### Phase 4: Benchmarking, Documentation & Portfolio Readies

- [ ] Verify 60fps performance without main thread blocking.
- [ ] Verify zero memory leaks on component unmounting.
- [ ] Create GitHub `README.md` with architecture diagrams and performance benchmarks.
