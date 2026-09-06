import React, { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { selectAllBlotterTrades } from './redux/selectors';
import { StatusBadge } from '@fx-platform/ui-components';
import { eventBus } from '@fx-platform/rx-engine';
import { tradeAdded, TradeOrder } from '@fx-platform/store';

export const BlotterTable: FC = () => {
  const dispatch = useAppDispatch();
  const allTrades = useAppSelector(selectAllBlotterTrades);

  useEffect(() => {
    // Listen for cross-MFE trade events via onEvent()
    const subscription = eventBus.onEvent().subscribe((event) => {
      console.log('event.type', event.type);

      if (event.type === 'ORDER_EXECUTED') {
        const tradeOrder: TradeOrder = {
          ...event.payload,
          status: 'COMPLETED',
        };
        dispatch(tradeAdded(tradeOrder));
      }
    });

    // Unsubscribe on unmount
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '16px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Trade Execution Blotter</h3>
      {allTrades.length === 0 ? (
        <p style={{ color: '#64748b' }}>No trades executed yet. Place an order from Pricing MFE.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '8px' }}>Order ID</th>
              <th style={{ padding: '8px' }}>Symbol</th>
              <th style={{ padding: '8px' }}>Side</th>
              <th style={{ padding: '8px' }}>Amount</th>
              <th style={{ padding: '8px' }}>Executed Price</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allTrades.map((trade) => (
              <tr key={trade.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontFamily: 'monospace' }}>{trade.orderId}</td>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{trade.symbol}</td>
                <td
                  style={{
                    padding: '8px',
                    color: trade.side === 'BUY' ? '#16a34a' : '#dc2626',
                    fontWeight: 'bold',
                  }}
                >
                  {trade.side}
                </td>
                <td style={{ padding: '8px' }}>{trade.amount.toLocaleString()}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                  {trade.executedPrice.toFixed(5)}
                </td>
                <td style={{ padding: '8px' }}>
                  <StatusBadge status={trade.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
