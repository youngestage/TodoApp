import { StateCreator } from 'zustand';
import { ChatMessage, ContextualComment, QuickNote } from '../../types';
import { sendChatMessageToDB, sendBuzzToDB } from '../../services';
import { StoreState } from '../useStore';

export interface ChatSlice {
  isFullChatActive: boolean;
  setFullChatActive: (active: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotificationsOpen: () => void;

  isQuickActionOpen: boolean;
  setQuickActionOpen: (open: boolean) => void;
  quickActionTab: 'expense' | 'task' | 'message';
  setQuickActionTab: (tab: 'expense' | 'task' | 'message' | any) => void;

  isSettleUpOpen: boolean;
  setSettleUpOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isQuickNoteOpen: boolean;
  setQuickNoteOpen: (open: boolean) => void;

  activeContextualThread: { type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL'; id: string; title: string } | null;
  openContextualThread: (item: { type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL'; id: string; title: string }) => void;
  closeContextualThread: () => void;

  chatMessages: ChatMessage[];
  sendChatMessage: (content: string, attachment?: ChatMessage['attachment']) => void;
  sendBuzz: () => void;

  contextualComments: ContextualComment[];
  addContextualComment: (targetId: string, targetType: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL', text: string) => void;

  quickNotes: QuickNote[];
  addQuickNote: (text: string) => void;
}

export const createChatSlice: StateCreator<StoreState, [], [], ChatSlice> = (set, get) => ({
  isFullChatActive: false,
  setFullChatActive: (active) => set({ isFullChatActive: active }),

  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  toggleNotificationsOpen: () => set((state: StoreState) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  isQuickActionOpen: false,
  setQuickActionOpen: (open) => set({ isQuickActionOpen: open }),
  quickActionTab: 'expense',
  setQuickActionTab: (tab) => set({ quickActionTab: tab }),

  isSettleUpOpen: false,
  setSettleUpOpen: (open) => set({ isSettleUpOpen: open }),
  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  isQuickNoteOpen: false,
  setQuickNoteOpen: (open) => set({ isQuickNoteOpen: open }),

  activeContextualThread: null,
  openContextualThread: (item) => set({ activeContextualThread: item }),
  closeContextualThread: () => set({ activeContextualThread: null }),

  chatMessages: [],
  sendChatMessage: (content, attachment) => {
    const stateAny: any = get();
    const senderName = stateAny.currentUser?.name || 'Partner';
    const currentUserId = stateAny.currentUser?.id;
    const householdId = stateAny.household?.id;

    const msgId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `msg-${Date.now()}`;

    const newMsg: ChatMessage = {
      id: msgId,
      senderName,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment
    };

    set((s: StoreState) => ({
      chatMessages: [...s.chatMessages, newMsg]
    }));

    if (householdId && currentUserId) {
      sendChatMessageToDB(householdId, currentUserId, senderName, content, attachment, msgId);
    }
  },

  sendBuzz: () => {
    const stateAny: any = get();
    const senderName = stateAny.currentUser?.name || 'Partner';
    const partnerName = stateAny.partnerUser?.name || 'Partner';
    const currentUserId = stateAny.currentUser?.id;
    const householdId = stateAny.household?.id;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } catch (e) {}
    }

    const buzzText = `⚡ Buzzed ${partnerName}`;

    const msgId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `msg-buzz-${Date.now()}`;

    const buzzMsg: ChatMessage = {
      id: msgId,
      senderName,
      content: buzzText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    set((s: StoreState) => ({
      chatMessages: [...s.chatMessages, buzzMsg]
    }));

    if (householdId && currentUserId) {
      sendBuzzToDB(householdId, currentUserId, senderName, partnerName, msgId);
    }
  },

  contextualComments: [],
  addContextualComment: (targetId, targetType, text) => set((state: StoreState) => {
    const senderName = state.currentUser?.name || 'Partner';
    const newComment: ContextualComment = {
      id: `comment-${Date.now()}`,
      targetId,
      targetType,
      authorName: senderName,
      text,
      timestamp: 'Just now'
    };
    return { contextualComments: [...state.contextualComments, newComment] };
  }),

  quickNotes: [],
  addQuickNote: (text) => set((state: StoreState) => {
    const senderName = state.currentUser?.name || 'Partner';
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      text,
      authorName: senderName,
      timestamp: 'Just now'
    };
    return { quickNotes: [newNote, ...state.quickNotes] };
  })
});
