import React, { FC, RefObject, useEffect, useRef } from 'react';
import { Subject, fxStreamService, takeUntil, RawTick } from '@fx-platform/rx-engine';

export const useDirectFXStream = (
    symbol: string,
    bidRef: RefObject<HTMLSpanElement | null>,
    askRef: RefObject<HTMLSpanElement | null>
) => {
    const latestPriceRef = useRef<RawTick | null>(null);

    useEffect(() => {
        const destory$ = new Subject<void>();

        fxStreamService
            .getSymbolStream(symbol)
            .pipe(takeUntil(destory$)) // Guarantees clean unsubscription on unmount
            .subscribe((tick: RawTick) => {
                latestPriceRef.current = tick;

                // avoid reconciliation (zero-Virtual DOM) and direct DOM updates
                if (bidRef.current) {
                    bidRef.current.textContent = tick.bid?.toLocaleString();
                }

                if (askRef.current) {
                    askRef.current.textContent = tick.ask?.toLocaleString();
                }
            });
        return () => {
            destory$.next(); // Emit cleanup signal to complete stream pipeline
            destory$.complete(); // Clean up signal subject memory
        }
    }, [symbol, bidRef, askRef]);

    return latestPriceRef;
}