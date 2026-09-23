import React, { forwardRef } from 'react';

export interface TradeButtonProps {
  side: 'BUY' | 'SELL';
  /** Optional price prop for standard React state-driven components */
  price?: number;
  disabled?: boolean;
  onClick: () => void;
}

export const TradeButton = forwardRef<HTMLSpanElement, TradeButtonProps>(
  ({ side, price, disabled = false, onClick }, ref) => {
    const isBuy = side === 'BUY';

    // Format display string if price prop is explicitly provided
    const formattedPrice = price !== undefined ? (price > 0 ? price.toFixed(5) : '---') : '---';

    const baseStyles: React.CSSProperties = {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      fontWeight: 'bold',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      backgroundColor: isBuy ? 'var(--color-buy)' : 'var(--color-sell)',
      color: 'var(--color-text-inverse)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      minWidth: '120px',
    };

    return (
      <button style={baseStyles} disabled={disabled} onClick={onClick}>
        <span>{side}</span>
        {/*
                Attaches forwarded ref for direct DOM mutation.
                If `price` prop is passed, renders initial/updated prop string.
                */}
        <span ref={ref}>{formattedPrice}</span>
      </button>
    );
  }
);

TradeButton.displayName = 'TradeButton';
