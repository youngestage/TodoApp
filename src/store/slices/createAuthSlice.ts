import { StateCreator } from 'zustand';
import { User, ViewMode } from '../../types';
import { supabase } from '../../lib/supabase';

export interface AuthSlice {
  session: any | null;
  setSession: (session: any) => void;
  logout: () => Promise<void>;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  isOnboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  currentUser: User;
  updateUserAvatar: (url: string) => void;
  updateUserName: (name: string) => Promise<void>;
}

export const defaultUser: User = {
  id: 'usr_me',
  name: 'Partner A',
  avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=UserA&backgroundColor=EF713F',
  isOnline: true,
  role: 'partner_a'
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  session: null,
  setSession: (session) => {
    set({ session });
    if (session?.user) {
      const metadata = session.user.user_metadata || {};
      const rawFallback = metadata.name || metadata.full_name || session.user.email?.split('@')[0] || 'Partner A';
      
      set((state: any) => {
        const currentName = state.currentUser?.name;
        const nameToUse = (currentName && currentName !== 'Partner A' && currentName !== 'usr_me')
          ? currentName
          : rawFallback;

        return {
          currentUser: {
            id: session.user.id,
            name: nameToUse,
            avatarUrl: metadata.avatar_url || state.currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/micah/svg?seed=' + nameToUse + '&backgroundColor=EF713F',
            isOnline: true,
            role: state.currentUser?.role || 'partner_a'
          }
        };
      });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
    localStorage.removeItem('coupletodo_onboarding_completed');
    set({
      session: null,
      currentView: 'onboarding',
      isOnboardingCompleted: false
    });
  },

  currentView: 'onboarding',
  setCurrentView: (view) => set({ currentView: view }),
  isOnboardingCompleted: localStorage.getItem('coupletodo_onboarding_completed') === 'true',
  setOnboardingCompleted: (completed) => {
    localStorage.setItem('coupletodo_onboarding_completed', completed ? 'true' : 'false');
    set({ isOnboardingCompleted: completed });
  },
  currentUser: defaultUser,
  updateUserAvatar: (url) => set((state) => ({
    currentUser: { ...state.currentUser, avatarUrl: url }
  })),
  updateUserName: async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state: any) => ({
      currentUser: {
        ...state.currentUser,
        name: trimmed
      }
    }));
    const userId = get().currentUser?.id || get().session?.user?.id;
    if (userId && !userId.startsWith('usr_')) {
      try {
        await supabase.from('profiles').update({ name: trimmed }).eq('id', userId);
      } catch (e) {
        console.warn('Error updating profile name in DB:', e);
      }
    }
  }
});
