import React from 'react';

export interface TradeButtonProps {
    side: 'BUY' | 'SELL';
    price: number;
    disabled?: boolean;
    onClick: () => void;
}

export const TradeButton: React.FC<TradeButtonProps> = ({
    side,
    price,
    disabled = false,
    onClick,
}) => {
    const isBuy = side === 'BUY';

    const baseStyles: React.CSSProperties = {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        backgroundColor: isBuy ? '#16a34a' : '#dc2626',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        minWidth: '120px',
    };

    return (
        <button style={baseStyles} disabled={disabled} onClick={onClick}>
            <span>{side}</span>
            <span>{price > 0 ? price.toFixed(5) : '---'}</span>
        </button>
    );
};