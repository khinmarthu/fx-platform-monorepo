import { Subject, Observable } from 'rxjs';
import { filter, sampleTime, share } from 'rxjs/operators';
import { RawTick } from './fxWorker.js';

// Act as the bridge between Worker and React components
export class FXStreamService {
  private tickSubject$ = new Subject<RawTick>();
  private worker: Worker | null = null;

  public readonly stream$: Observable<RawTick>;

  constructor() {
    this.stream$ = this.tickSubject$.asObservable().pipe(
      // Backpressure: Throttle updates to ~60fps (16ms frame budget)
      sampleTime(16),
      // Multicasting: Share execution across all subscribers
      share()
    );
  }

  /**
   * Connects to the WebSocket stream via off-thread Web Worker
   */
  public connect(wsUrl: string = 'ws://localhost:8080'): void {
    if (this.worker) return;

    this.worker = new Worker(
      new URL('./fxWorker.js', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event: MessageEvent) => {
      if (event.data?.type === 'TICK') {
        // console.log('FXStreamService TICK:');
        this.tickSubject$.next(event.data.data);
      }
    };

    this.worker.postMessage({ action: 'CONNECT', url: wsUrl });
  }

  public getSymbolStream(symbol: string): Observable<RawTick> {
    return this.stream$.pipe(filter((tick) => tick.symbol === symbol));
  }

  public disconnect(): void {
    if (this.worker) {
      this.worker.postMessage({ action: 'DISCONNECT' });
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const fxStreamService = new FXStreamService();
