// before running pnpm dev, the host application hasn't connected to ports 3001 or 3002 over HTTP yet.
// Without remotes.d.ts, TypeScript immediately flags red underline errors on import('pricing_mfe/PricingApp') 
// because @mf-types folder under apps/shell-app hasn't been fetched from the network yet. 
// remotes.d.ts acts as a fallback safety net for instant IDE load.

// When @mf-types/ is absent (before dev server startup), TypeScript gracefully falls back to remotes.d.ts.

// When @mf-types/ is present, TypeScript uses the strict, auto-generated type definitions.
// check paths in apps/shell-app/tsconfig.json

declare module 'pricing_mfe/PricingApp' {
    const PricingApp: React.ComponentType;
    export default PricingApp;
}

declare module 'blotter_mfe/BlotterApp' {
    const BlotterApp: React.ComponentType;
    export default BlotterApp;
}