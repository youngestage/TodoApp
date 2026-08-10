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
}

export const defaultUserLeslie: User = {
  id: 'usr_me',
  name: 'Partner A',
  avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Leslie&backgroundColor=EF713F',
  isOnline: true,
  role: 'partner_a'
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  session: null,
  setSession: (session) => {
    set({ session });
    if (session?.user) {
      const metadata = session.user.user_metadata || {};
      const name = metadata.name || session.user.email?.split('@')[0] || 'Partner A';
      
      set({
        currentUser: {
          id: session.user.id,
          name,
          avatarUrl: metadata.avatar_url || 'https://api.dicebear.com/7.x/micah/svg?seed=' + name + '&backgroundColor=EF713F',
          isOnline: true,
          role: 'partner_a'
        }
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
  currentUser: defaultUserLeslie,
  updateUserAvatar: (url) => set((state) => ({
    currentUser: { ...state.currentUser, avatarUrl: url }
  }))
});
