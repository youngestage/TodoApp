import { StateCreator } from 'zustand';
import { Household, User } from '../../types';
import {
  fetchHouseholdDataFromDB,
  ensureUserHouseholdInDB,
  joinHouseholdWithKeyInDB,
  leaveHouseholdInDB,
  getPermanentInviteCode
} from '../../services';

export interface HouseholdSlice {
  household: Household;
  partnerUser: User;
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

export const createHouseholdSlice: StateCreator<HouseholdSlice, [], [], HouseholdSlice> = (set, get) => ({
  household: defaultHousehold,
  partnerUser: defaultWaitingPartner,

  fetchHouseholdData: async (householdId: string) => {
    const stateAny: any = get();
    const sessionUserId = stateAny.session?.user?.id || stateAny.currentUser?.id;
    const data = await fetchHouseholdDataFromDB(householdId, sessionUserId);
    if (data) {
      set((state: any) => ({
        household: data.household,
        partnerUser: data.partnerUser,
        ...(data.currentUser ? { currentUser: data.currentUser } : {}),
        tasks: data.tasks.length > 0 ? data.tasks : state.tasks,
        folders: data.folders && data.folders.length > 0 ? data.folders : state.folders || [],
        transactions: data.transactions.length > 0 ? data.transactions : state.transactions,
        recurringBills: data.recurringBills && data.recurringBills.length > 0 ? data.recurringBills : state.recurringBills,
        debtAccounts: data.debtAccounts && data.debtAccounts.length > 0 ? data.debtAccounts : state.debtAccounts,
        savingsGoals: data.savingsGoals && data.savingsGoals.length > 0 ? data.savingsGoals : state.savingsGoals,
        incomeStreams: data.incomeStreams && data.incomeStreams.length > 0 ? data.incomeStreams : state.incomeStreams,
        chatMessages: data.chatMessages.length > 0 ? data.chatMessages : state.chatMessages,
        quickNotes: data.quickNotes.length > 0 ? data.quickNotes : state.quickNotes
      }));
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

  updateHouseholdStartDate: (date) => set((state) => ({
    household: {
      ...state.household,
      relationshipStartDate: date
    }
  }))
});
