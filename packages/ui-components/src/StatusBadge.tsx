import React from 'react';

export interface StatusBadgeProps {
    status: 'COMPLETED' | 'PENDING' | 'REJECTED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getColors = () => {
        switch (status) {
            case 'COMPLETED':
                return { bg: '#dcfce7', text: '#15803d' };
            case 'PENDING':
                return { bg: '#fef9c3', text: '#a16207' };
            case 'REJECTED':
                return { bg: '#fee2e2', text: '#b91c1c' };
        }
    };

    const colors = getColors();

    const style: React.CSSProperties = {
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        display: 'inline-block',
    };

    return <span style={style}>{status}</span>;
};