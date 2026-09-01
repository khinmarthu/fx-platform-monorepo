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
- [ ] **`packages/store`**
  - [x] Configure `package.json` with package name `@fx-platform/store`.
  - [ ] Define shared TypeScript interfaces (`TickData`, `TradeOrder`, `ExecutionEvent`).
  - [ ] Export Redux Toolkit `createEntityAdapter` configuration helpers.
- [ ] **`packages/ui-components`**
  - [ ] Configure `package.json` with package name `@fx-platform/ui-components`.
  - [ ] Implement shared design system components (`Button`, `Card`, `Table`, `Badge`).

### Phase 3: Application Development (`apps/`)
- [ ] **`apps/pricing-mfe` (Live Pricing)**
  - [ ] Wire dependency `@fx-platform/rx-engine`.
  - [ ] Build custom `useFXStream` hook with auto-unsubscribe via `takeUntil`.
  - [ ] Build high-frequency `<PriceTile />` components (Direct RxJS-to-DOM).
  - [ ] Implement "Execute Trade" button emitting events onto the RxJS Event Bus.
- [ ] **`apps/blotter-mfe` (Trade History)**
  - [ ] Wire dependencies `@fx-platform/rx-engine` and `@fx-platform/store`.
  - [ ] Set up local Redux Toolkit store using `createEntityAdapter`.
  - [ ] Implement Master Stream subscription listening to `ORDER_EXECUTED` events.
  - [ ] Build `<OrderBlotterTable />` with $O(1)$ row updates via `selectOrderById`.
- [ ] **`apps/shell-app` (Shell MFE)**
  - [ ] Build workspace layout frame, top navigation bar, and user status header.
  - [ ] Render and layout `<PricingMFE />` and `<BlotterMFE />` in a split workstation view.

### Phase 4: Benchmarking, Documentation & Portfolio Readies
- [ ] Verify 60fps performance without main thread blocking.
- [ ] Verify zero memory leaks on component unmounting.
- [ ] Create GitHub `README.md` with architecture diagrams and performance benchmarks.