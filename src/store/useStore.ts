import { create } from 'zustand';
import {
  AuthSlice,
  createAuthSlice,
  HouseholdSlice,
  createHouseholdSlice,
  TaskSlice,
  createTaskSlice,
  TransactionSlice,
  createTransactionSlice,
  ChatSlice,
  createChatSlice
} from './slices';

export type StoreState = AuthSlice & HouseholdSlice & TaskSlice & TransactionSlice & ChatSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createHouseholdSlice(...a),
  ...createTaskSlice(...a),
  ...createTransactionSlice(...a),
  ...createChatSlice(...a)
}));
