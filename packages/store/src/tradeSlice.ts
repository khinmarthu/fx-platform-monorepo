import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TradeOrder, TradeStatus } from './types';

// adding custom id as "string" from orderId to override RTK default expectation for required "id"
const tradesAdapter = createEntityAdapter<TradeOrder, string>({
  selectId: (trade) => trade.orderId,
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

const initialState = tradesAdapter.getInitialState({
  loading: false,
  error: null,
  status: TradeStatus.idle,
});

const tradeSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    // I wanted to have TypeScript Payload Enforcement instead of using Direct Shorthand
    // tradeAdded: tradesAdapter.addOne,

    // adds a single new trade to state
    tradeAdded: (state, action: PayloadAction<TradeOrder>) =>
      tradesAdapter.addOne(state, action.payload),

    // overwrites existing collection entirely with an array of incoming trades
    tradesBulkLoaded: (state, action: PayloadAction<TradeOrder[]>) =>
      tradesAdapter.setAll(state, action.payload),

    // removes a single trade from the state via its id string
    tradeRemoved: (state, action: PayloadAction<string>) =>
      tradesAdapter.removeOne(state, action.payload),

    // updates specific properties of a trade matching a specific target ID
    tradeUpdated: (state, action: PayloadAction<{ id: string; changes: Partial<TradeOrder> }>) =>
      tradesAdapter.updateOne(state, action.payload),

    // updates custom extra state flags
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { tradeAdded, tradesBulkLoaded, tradeRemoved, tradeUpdated, setLoading } =
  tradeSlice.actions;

export const {
  selectAll: selectAllTrades,
  selectById: selectTradeById,
  selectIds: selectTradeIds,
  selectTotal: selectTotalTrades,
  selectEntities: selectTradeEntities,
} = tradesAdapter.getSelectors();
// not adding state shape mapping in this shared packages/store because I am going to put it inside the consuming MFE
// leaving getSelectors() parameterless makes the shared package flexible

export const tradeReducer = tradeSlice.reducer;
