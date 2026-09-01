# FX Trading Platform Monorepo

A high-performance enterprise FX Trading Workstation showcasing a **3-Micro-Frontend (MFE)** architecture built with **pnpm Workspaces**, **Turborepo**, **RxJS backpressure streaming**, and **Redux Toolkit normalized state**.

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

### 2. Workspace Monorepo Commands

```bash
# Start all micro-frontend apps in development mode via Turborepo
pnpm dev

# Build all applications and packages for production
pnpm build

# Run linting across all workspace packages
pnpm lint
```

---

## Implementation Roadmap

- [x] **Phase 1: Monorepo Scaffolding & Setup**
  - Turborepo, pnpm workspaces, and TypeScript configuration.
- [x] **Phase 2: RxJS Stream Engine (`packages/rx-engine`)**
  - Web Worker off-thread WebSocket parser (`fxWorker.ts`).
  - Throttled `FXStreamService` (`sampleTime(16)`).
  - Cross-MFE `EventBus`.
- [x] **Phase 2: Shared Store (`packages/store`)**
  - Shared domain interfaces (`types.ts`).
  - Redux `createEntityAdapter<TradeOrder, string>` normalized state (`tradeSlice.ts`) setup.
- [ ] **Phase 2: Shared UI Components (packages/ui-components)**
  - Reusable React design system components & Tailwind setup.
- [ ] **Phase 3: Micro-Frontend Apps (`apps/`)**
  - `pricing-mfe`, `blotter-mfe`, and `shell-app` integration.
