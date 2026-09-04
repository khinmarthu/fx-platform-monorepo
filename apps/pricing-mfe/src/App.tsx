import React, { FC, useEffect } from "react";
import { fxStreamService } from '@fx-platform/rx-engine';
import { PricingTile } from './PricingTile';

const SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];

export const App: FC = () => {
    useEffect(() => {
        fxStreamService.connect("ws://localhost:8080");
        return () => {
            fxStreamService.disconnect();
        }
    }, []);

    return <>{
        SYMBOLS.map((symbol) => <PricingTile key={symbol} symbol={symbol} />)
    }</>
}