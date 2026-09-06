import { configureStore } from '@reduxjs/toolkit';
import { tradeReducer } from '@fx-platform/store';

export const store = configureStore({
  reducer: {
    trades: tradeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
