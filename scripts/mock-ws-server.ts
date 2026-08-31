import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('[Mock WS Server] Running on ws://localhost:8080');

// mock web socket server
wss.on('connection', (ws) => {
    console.log('Client connected to FX Tick Stream');

    const interval = setInterval(() => {

        const tick = {
            symbol: 'EUR/USD',
            bid: +(1.0850 + (Math.random() - 0.5) * 0.001).toFixed(5),
            ask: +(1.0852 + (Math.random() - 0.5) * 0.001).toFixed(5),
            timestamp: Date.now(),
        };
        // console.log('tick:', tick);

        ws.send(JSON.stringify(tick));

        ws.on('message', (wsEvent) => {
            console.log('Web socket server received: ');
        })
    }, 10); // 1000 / 10 = 100 ticks/sec throughput stream

    ws.on('close', () => clearInterval(interval));
});

