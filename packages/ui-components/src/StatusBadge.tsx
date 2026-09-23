import React from 'react';

export interface StatusBadgeProps {
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: `var(--status-${status.toLowerCase()}-bg)`,
    color: `var(--status-${status.toLowerCase()}-text)`,
    display: 'inline-block',
  };

  return <span style={style}>{status}</span>;
};
