/**
 * Shared Domain Models
 */

export interface TickData {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

export interface TradeOrder {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  executedPrice: number;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
}

export enum TradeStatus {
  idle = 'idle',
  loading = 'loading',
  failed = 'failed',
}
