/**
 * Web Worker for FX WebSocket Streaming
 *
 * Enterprise Rationale:
 * Offloads WebSocket connection management, binary/text payload decoding,
 * and CPU-heavy JSON parsing off the main thread to prevent React rendering jank.
 */

export interface RawTick {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

export type WorkerMessage = { action: 'CONNECT'; url: string } | { action: 'DISCONNECT' };

let socket: WebSocket | null = null;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.action === 'CONNECT') {
    if (socket) {
      socket.close();
    }

    socket = new WebSocket(message.url);

    socket.onmessage = (wsEvent: MessageEvent) => {
      try {
        // console.log('fxWorker onmessage');

        // Offload JSON parsing from the main UI thread
        const tick: RawTick = JSON.parse(wsEvent.data);
        // console.log('fxWorker tick');

        self.postMessage({ type: 'TICK', data: tick });
      } catch {
        self.postMessage({ type: 'ERROR', error: 'Failed to parse JSON tick' });
      }
    };

    socket.onerror = (error) => {
      self.postMessage({ type: 'STATUS', status: 'ERROR', error });
    };

    socket.onclose = () => {
      self.postMessage({ type: 'STATUS', status: 'DISCONNECTED' });
    };

    socket.onopen = () => {
      // console.log('fxWorker onopen');
      self.postMessage({ type: 'STATUS', status: 'CONNECTED' });
    };
  } else if (message.action === 'DISCONNECT') {
    if (socket) {
      socket.close();
      socket = null;
    }
  }
};
