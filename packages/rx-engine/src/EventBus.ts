import { Observable, Subject } from 'rxjs';

export interface TradeEvent {
  type: 'ORDER_EXECUTED';
  payload: {
    orderId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    amount: number;
    executedPrice: number;
    timestamp: number;
  };
}

export class EventBus {
  private eventSubject$ = new Subject<TradeEvent>();

  /**
   * Publish a cross-MFE event.
   */
  public emit(trade: TradeEvent): void {
    this.eventSubject$.next(trade);
  }

  /**
   * Listen for cross-MFE events.
   */
  public onEvent(): Observable<TradeEvent> {
    return this.eventSubject$.asObservable();
  }
}

export const eventBus = new EventBus();
