import React, { FC, memo, useEffect, useRef } from 'react';
import { eventBus } from '@fx-platform/rx-engine';
import { TradeButton } from '@fx-platform/ui-components';
import { useDirectFXStream } from './useDirectFXStream';

interface IProps {
    symbol: string;
}

export const PricingTile: FC<IProps> = memo(({ symbol }) => {
    const bidPriceRef = useRef<HTMLSpanElement | null>(null);
    const asktPriceRef = useRef<HTMLSpanElement | null>(null);
    const latestPriceRef = useDirectFXStream(symbol, bidPriceRef, asktPriceRef);

    const handleExecute = (side: 'BUY' | 'SELL') => {
        const price = side === 'BUY' ? latestPriceRef.current?.ask : latestPriceRef.current?.bid;
        if (!price) return;

        eventBus.emit({
            type: "ORDER_EXECUTED",
            payload: {
                orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                symbol,
                side,
                amount: 100000,
                executedPrice: price,
                timestamp: Date.now(),
            }
        })
    }

    return (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            width: '280px',
            backgroundColor: '#ffffff'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{symbol}</h3>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <TradeButton
                    side="SELL"
                    ref={bidPriceRef}
                    onClick={() => handleExecute('SELL')}
                />
                <TradeButton
                    side="BUY"
                    ref={asktPriceRef}
                    onClick={() => handleExecute('BUY')}
                />
            </div>
        </div>
    )
});