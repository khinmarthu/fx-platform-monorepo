import React, { FC, useEffect } from 'react';
import { fxStreamService } from '@fx-platform/rx-engine';
import { PricingTile } from './PricingTile';

const SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];

export const App: FC = () => {
  useEffect(() => {
    fxStreamService.connect(import.meta.env.VITE_WS_URL);
    return () => {
      fxStreamService.disconnect();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {SYMBOLS.map((symbol) => (
        <PricingTile key={symbol} symbol={symbol} />
      ))}
    </div>
  );
};

export default App;