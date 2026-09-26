# FX Trading Platform Monorepo

A high-performance enterprise FX Trading showcasing a **3-Micro-Frontend (MFE)** architecture built with **pnpm Workspaces**, **Turborepo**, **RxJS backpressure streaming**, and **Redux Toolkit normalized state**.

---

## Architecture Overview

```
                        ┌────────────────────────┐
                        │       Shell App        │
                        │     (Host - 3000)      │
                        └───────────┬────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│      Pricing MFE      │                       │      Blotter MFE      │
│    (Remote - 3001)    │                       │    (Remote - 3002)    │
└───────────────────────┘                       └───────────────────────┘
```

- **`apps/shell-app` (Port 3000):** Host container orchestrating remote micro-frontends and dynamic route resolution.
- **`apps/pricing-mfe` (Port 3001):** High-frequency streaming price grid powered by `@fx-platform/rx-engine` running off-main-thread Web Workers.
- **`apps/blotter-mfe` (Port 3002):** Trade execution blotter managing transaction logs via `@fx-platform/store`.
- **`packages/`:** Shared workspace packages (`rx-engine`, `store`, `ui-components`).

---

## Architecture Blueprint

```text
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
                                   │  STREAM ENGINE   │
                                   │  (`rx-engine`)   │
                                   └──────────────────┘
```

---

## Technical Highlights & Engineering Decisions

1. **Off-Main-Thread WebSocket Parsing (`packages/rx-engine`)**
   - WebSockets stream market data updates at high tick velocities (100+ updates/sec).
   - WebSocket connection management, binary decoding, and JSON parsing are executed inside a dedicated **Web Worker** (`fxWorker.ts`). This ensures CPU-heavy parsing never blocks React's main UI rendering thread.

2. **RxJS Backpressure Throttling**
   - Emitted tick data is piped through `sampleTime(16)` inside `FXStreamService.ts`, capping rate updates to ~16ms intervals (**60fps** browser frame budget).
   - Uses `share()` multicasting to ensure multiple component subscribers consume a single unified worker feed without creating redundant connections.

3. **Normalized Redux Toolkit State (`packages/store`)**
   - High-throughput trade log updates use Redux Toolkit's `createEntityAdapter` for **$O(1)$ lookup and update complexity**.

---

## Monorepo Layout

```text
fx-platform-monorepo/
├── apps/
│   ├── shell-app/        # Host shell container MFE
│   ├── pricing-mfe/      # High-frequency price grid MFE
│   └── blotter-mfe/      # Trade execution log MFE
├── packages/
│   ├── rx-engine/        # Shared RxJS Web Worker stream engine & EventBus
│   ├── store/            # Shared Redux Toolkit adapters & types
│   └── ui-components/    # Shared design system components
└── scripts/
    ├── mock-ws-server.ts # Local mock WebSocket server (100 ticks/sec)
    └── test-rx-engine.ts # Terminal integration test runner for rx-engine
```

---

## Prerequisites & Installation

### Requirements

- **Node.js**: `^20.0.0` or higher
- **pnpm**: `11.24.0` (managed via `packageManager` field)

### Setup

```bash
# Clone the repository
git clone https://github.com/khinmarthu/fx-platform-monorepo.git
cd fx-platform-monorepo

# Install workspace dependencies
pnpm install
```

---

## Running Development & Test Scripts

### 1. Running Local Utilities (`scripts/`)

#### Step A: Start the Mock WebSocket Server

Runs a local WebSocket server at `ws://localhost:8080` streaming 100 ticks/sec across major FX pairs (`EUR/USD`, `GBP/USD`, `USD/JPY`, `AUD/USD`).

```bash
pnpm mock:ws
```

#### Step B: Run the Stream Engine Integration Test

In a separate terminal window (while `pnpm mock:ws` is running), test the `@fx-platform/rx-engine` pipeline directly in your terminal to verify worker communication, backpressure throttling, and symbol filtering:

```bash
cd packages/rx-engine && pnpm build && cd ../..
```

```bash
pnpm test:rx
```

---

### 2. Development Mode
Start all micro-frontends and the host shell concurrently in development mode:
```bash
# please ensure to start web socket first `pnpm mock:ws`
pnpm dev
```

This starts:
- **Pricing MFE:** `http://localhost:3001`
- **Blotter MFE:** `http://localhost:3002`
- **Shell:** `http://localhost:3000`

Open **`http://localhost:3000`** in your browser to interact with the FX Trading.

---

### 3. Production Build & Preview

#### 1. Compile Monorepo
Build all packages and applications for production:
```bash
# please ensure to start web socket first `pnpm mock:ws`
pnpm build
```

#### 2. Preview Production Bundles
Serve the minified production outputs with CORS and Module Federation support enabled:
```bash
pnpm --parallel --filter "./apps/*" preview
```

Open **`http://localhost:3000`** to test production bundle execution.

---

### 4. Docker (full stack via docker-compose)

Five services, one shared network: `gateway` (nginx, the only one publishing
a port) reverse-proxies `/` → `shell`, `/pricing/` → `pricing`, `/blotter/` →
`blotter`, and `/ws` → `mock-ws-server`, matching a single-origin production
topology instead of exposing each app on its own port.

```bash
docker compose up -d --build
```

Open **`http://localhost:8080`** — this is the one address everything is
served from; the individual app containers publish no ports of their own.

```bash
docker compose down   # stop + remove containers and the network (images stay cached)
```

### 5. Docker (per-app image testing)

Useful for investigating a build or runtime issue in one app in isolation,
without the rest of the stack. Build context must be the repo root for all
three (`turbo prune` needs to see the whole workspace), even though each
Dockerfile lives inside its own app folder.

**shell-app** (serves at `/`):
```bash
docker build -f apps/shell-app/Dockerfile \
  --build-arg VITE_PRICING_MFE_URL=/pricing \
  --build-arg VITE_BLOTTER_MFE_URL=/blotter \
  -t fx-platform-shell-app:local .
docker run -d --rm --name shell-test -p 8081:80 fx-platform-shell-app:local
# check: curl http://localhost:8081/
docker stop shell-test
```

**pricing-mfe** (serves at `/pricing/`):
```bash
docker build -f apps/pricing-mfe/Dockerfile \
  --build-arg VITE_WS_URL=ws://localhost:8080 \
  -t fx-platform-pricing-mfe:local .
docker run -d --rm --name pricing-test -p 8082:80 fx-platform-pricing-mfe:local
# check: curl http://localhost:8082/pricing/
docker stop pricing-test
```

**blotter-mfe** (serves at `/blotter/`):
```bash
docker build -f apps/blotter-mfe/Dockerfile \
  -t fx-platform-blotter-mfe:local .
docker run -d --rm --name blotter-test -p 8085:80 fx-platform-blotter-mfe:local
# check: curl http://localhost:8085/blotter/
docker stop blotter-test
```

---

## Implementation Roadmap

- [x] **Phase 1: Monorepo Scaffolding & Setup**
  - Turborepo, pnpm workspaces, and TypeScript configuration.
- [x] **Phase 2: RxJS Stream Engine (`packages/rx-engine`)**
  - Web Worker off-thread WebSocket parser (`fxWorker.ts`).
  - Throttled `FXStreamService` (`sampleTime(16)`).
  - Cross-MFE `EventBus` and RxJS utility re-exports.
- [x] **Phase 2: Shared Store (`packages/store`)**
  - Shared domain interfaces (`types.ts`).
  - Redux `createEntityAdapter<TradeOrder, string>` normalized state (`tradeSlice.ts`) setup.
- [x] **Phase 2: Shared UI Components (packages/ui-components)**
  - Hybrid TradeButton with forwardRef direct DOM support and prop fallbacks.
  - StatusBadge design component.
  - Configured peerDependencies contract to prevent multiple React instances.
- [x] **Phase 3: Live Pricing MFE (apps/pricing-mfe)**
  - Headless useDirectFXStream hook with auto-unsubscription.
  - Micro-subscribing rate grid bypassing VDOM reconciliation via ref forwarding.
  - Order execution event publishing on EventBus.
- [x] **Phase 3: Trade Blotter MFE (`apps/blotter-mfe`)**
  - **Module Federation 2.0 Integration:** Configured `@module-federation/vite` exposing `./BlotterApp` and declaring singletons for `react`, `react-dom`, `react-redux`, `@fx-platform/rx-engine`, `@fx-platform/store`, and `@fx-platform/ui-components`.
  - **Local Redux State Management:** Integrated `tradeReducer` from `@fx-platform/store` into a local Redux Toolkit store instance to manage trade entity state.
  - **Cross-MFE Messaging:** Implemented `eventBus.onEvent()` subscription listening for `ORDER_EXECUTED` events published from `pricing-mfe`.
  - **UI Implementation:** Built `<BlotterTable />` to render executed trades with real-time updates and status badges.
- [x] **Phase 3: Host Shell App (apps/shell-app)**
  - Main shell layout mounting pricing-mfe and blotter-mfe.
