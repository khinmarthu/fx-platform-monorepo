import React, { Suspense } from 'react';

const PricingApp = React.lazy(() => import('pricing_mfe/PricingApp'));
const BlotterApp = React.lazy(() => import('blotter_mfe/BlotterApp'));

export const App: React.FC = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text-app)', minHeight: '100vh' }}>
            <h1>FX Trading</h1>
            <main style={{ display: 'grid', gridTemplateColumns: 'auto 2fr', gap: '20px',  color: 'var(--color-bg-app)', }}>
                <Suspense fallback={<div>Loading Pricing...</div>}>
                    <PricingApp />
                </Suspense>
                <Suspense fallback={<div>Loading Blotter...</div>}>
                    <BlotterApp />
                </Suspense>
            </main>
        </div>
    );
};

export default App;