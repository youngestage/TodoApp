import { StateCreator } from 'zustand';
import { Household, User } from '../../types';
import {
  fetchHouseholdDataFromDB,
  ensureUserHouseholdInDB,
  joinHouseholdWithKeyInDB,
  leaveHouseholdInDB,
  getPermanentInviteCode,
  updateHouseholdStartDateInDB
} from '../../services';

import { StoreState } from '../useStore';

export interface HouseholdSlice {
  household: Household;
  partnerUser: User;
  setPartnerPresence: (isOnline: boolean, lastSeen?: string) => void;
  fetchHouseholdData: (householdId: string) => Promise<void>;
  ensureUserHousehold: (userId: string, userName: string) => Promise<void>;
  joinHouseholdWithKey: (inviteCode: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  updateHouseholdStartDate: (date: string) => void;
}

export const defaultWaitingPartner: User = {
  id: 'usr_partner_waiting',
  name: 'Waiting for Partner...',
  avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=WaitingPartner',
  isOnline: false,
  role: 'partner_b'
};

export const defaultHousehold: Household = {
  id: 'hh_initial',
  name: 'My Household',
  inviteCode: getPermanentInviteCode(),
  maxMembers: 2,
  members: [],
  settleBalance: {
    debtor: 'Waiting for Partner...',
    creditor: 'Partner A',
    amount: 0,
    currency: '₦'
  }
};

export const createHouseholdSlice: StateCreator<StoreState, [], [], HouseholdSlice> = (set, get) => ({
  household: defaultHousehold,
  partnerUser: defaultWaitingPartner,

  setPartnerPresence: (isOnline: boolean, lastSeen?: string) => {
    set((state: any) => ({
      partnerUser: {
        ...state.partnerUser,
        isOnline,
        ...(lastSeen ? { lastSeen } : (isOnline ? {} : { lastSeen: new Date().toISOString() }))
      }
    }));
  },

  fetchHouseholdData: async (householdId: string) => {
    const stateAny: any = get();
    const sessionUserId = stateAny.session?.user?.id || stateAny.currentUser?.id;
    const data = await fetchHouseholdDataFromDB(householdId, sessionUserId);
    if (data) {
      set({
        household: data.household,
        partnerUser: data.partnerUser,
        ...(data.currentUser ? { currentUser: data.currentUser } : {}),
        tasks: data.tasks,
        folders: data.folders || [],
        transactions: data.transactions,
        recurringBills: data.recurringBills || [],
        debtAccounts: data.debtAccounts || [],
        savingsGoals: data.savingsGoals || [],
        incomeStreams: data.incomeStreams || [],
        chatMessages: data.chatMessages,
        quickNotes: data.quickNotes,
        contextualComments: data.contextualComments || []
      });
    }
  },

  ensureUserHousehold: async (userId: string, userName: string) => {
    const hhId = await ensureUserHouseholdInDB(userId, userName);
    if (hhId) {
      await get().fetchHouseholdData(hhId);
    }
  },

  joinHouseholdWithKey: async (inviteCode: string) => {
    const stateAny: any = get();
    const currentUserId = stateAny.session?.user?.id || stateAny.currentUser?.id;
    const currentUserName = stateAny.currentUser?.name || 'Partner';
    const hhId = await joinHouseholdWithKeyInDB(inviteCode, currentUserId, currentUserName);
    await get().fetchHouseholdData(hhId);
  },

  leaveHousehold: async () => {
    const stateAny: any = get();
    const currentUserId = stateAny.session?.user?.id || stateAny.currentUser?.id;
    const currentHouseholdId = stateAny.household?.id;
    const currentUserName = stateAny.currentUser?.name || 'Partner';

    const newCode = await leaveHouseholdInDB(currentUserId, currentHouseholdId, currentUserName);

    set({
      household: {
        id: 'hh_initial',
        name: `${currentUserName}'s Household`,
        inviteCode: newCode,
        maxMembers: 2,
        members: stateAny.currentUser ? [stateAny.currentUser] : [],
        settleBalance: {
          debtor: 'Waiting for Partner...',
          creditor: currentUserName,
          amount: 0,
          currency: '₦'
        }
      },
      partnerUser: defaultWaitingPartner
    });
  },

  updateHouseholdStartDate: (date) => {
    const hhId = get().household?.id;
    set((state) => ({
      household: {
        ...state.household,
        relationshipStartDate: date
      }
    }));
    if (hhId) {
      updateHouseholdStartDateInDB(hhId, date);
    }
  }
});
