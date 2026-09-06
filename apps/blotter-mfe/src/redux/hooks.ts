import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from './store';

// Use these throughout your app instead of plain `useDispatch` and `useSelector`
// Pre-typed hooks to avoid repetitive type declarations of RootState and AppDispatch across components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;