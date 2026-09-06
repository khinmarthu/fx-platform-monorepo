// 1. Polyfill browser Worker API for Node environment before loading FXStreamService
import Worker from 'web-worker';
if (typeof globalThis.Worker === 'undefined') {
  (globalThis as any).Worker = Worker;
}

// import { FXStreamService } from '../packages/rx-engine/src/FXStreamService.js';

// need to run build first below
// cd packages/rx-engine && pnpm build && cd ../..
import { FXStreamService } from '../packages/rx-engine/dist/FXStreamService.js';

console.log('🚀 Instantiating FXStreamService...');
const streamService = new FXStreamService();

// 2. Subscribe FIRST (RxJS observables are lazy and need observers)
console.log('🎧 Subscribing to getSymbolStream("EUR/USD")...');
const subscription = streamService.getSymbolStream('EUR/USD').subscribe({
  next: (tick) => {
    console.log('⚡ [FXStreamService -> Throttled Tick Received]:', {
      symbol: tick.symbol,
      bid: tick.bid,
      ask: tick.ask,
      time: new Date(tick.timestamp).toISOString().split('T')[1].slice(0, -1),
    });
  },
  error: (err) => console.error('❌ Stream Error:', err),
});

// 3. Explicitly CONNECT to trigger Worker instantiation & WebSocket handshakes
console.log('🔌 Calling streamService.connect("ws://localhost:8080")...');
streamService.connect('ws://localhost:8080');

// Auto shut down test after 5 seconds
setTimeout(() => {
  console.log('✅ Test complete. Disconnecting worker and unwiring subscriptions.');
  streamService.disconnect();
  subscription.unsubscribe();
  process.exit(0);
}, 5000);
