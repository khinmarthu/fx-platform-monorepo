import { selectAllTrades } from '@fx-platform/store';
import { RootState } from './store';

// Local Slice Mapping Selector
export const selectTradesSlice = (state: RootState) => state.trades;

export const selectAllBlotterTrades = (state: RootState) =>
  selectAllTrades(selectTradesSlice(state));
