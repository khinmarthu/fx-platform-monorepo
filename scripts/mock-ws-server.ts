import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`[Mock WS Server] Running on ws://localhost:${PORT}`);

interface RawTick {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

const SYMBOLS: Record<string, { base: number; spread: number }> = {
  'EUR/USD': { base: 1.0850, spread: 0.0002 },
  'GBP/USD': { base: 1.2640, spread: 0.0003 },
  'USD/JPY': { base: 155.20, spread: 0.0200 },
  'AUD/USD': { base: 0.6530, spread: 0.0002 },
};

function generateTick(symbol: string): RawTick {
  const config = SYMBOLS[symbol];
  const delta = (Math.random() - 0.498) * 0.001 * config.base;
  const newBid = parseFloat((config.base + delta).toFixed(symbol.includes('JPY') ? 3 : 5));
  config.base = newBid;

  return {
    symbol,
    bid: newBid,
    ask: parseFloat((newBid + config.spread).toFixed(symbol.includes('JPY') ? 3 : 5)),
    timestamp: Date.now(),
  };
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[Mock WS Server] Client connected');

  // Stream high-frequency ticks every 10ms (100 ticks/second)
  const keys = Object.keys(SYMBOLS);
  const intervalId = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const randomSymbol = keys[Math.floor(Math.random() * keys.length)];
      const tick = generateTick(randomSymbol);
      ws.send(JSON.stringify(tick));
    }
  }, 10);

  ws.on('close', () => {
    console.log('[Mock WS Server] Client disconnected');
    clearInterval(intervalId);
  });
});