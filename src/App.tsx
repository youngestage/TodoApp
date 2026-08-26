import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { BudgetView } from './components/views/BudgetView';
import { ChatView } from './components/views/ChatView';
import { OnboardingView } from './components/views/OnboardingView';
import { InviteView } from './components/views/InviteView';
import { SettingsView } from './components/views/SettingsView';

import { QuickActionSheet, ContextualThreadDrawer, NotificationsDrawer } from './components/drawers';
import { SettleUpModal, QuickNoteModal, SettingsModal } from './components/modals';
import { WelcomeWoosh, InstallPromptBanner } from './components/widgets';
import {
  sendPushNotification,
  sendBackgroundPushToPartner,
  NOTIFICATION_TAGS
} from './utils/notifications';
import { updateUserPresenceInDB } from './services';
import { Lock, TickCircle, ArrowRight, CloseCircle } from 'iconsax-react';

export default function App() {
  const { currentView, setCurrentView, setSession, isOnboardingCompleted, isNotificationsOpen, setOnboardingCompleted, household, fetchHouseholdData, currentUser, partnerUser, setPartnerPresence } = useStore();

  // Register Web Push subscription for background notifications.
  // NOTE: iOS requires this via a user gesture (Settings page toggle).
  // Here we only auto-subscribe on Android/desktop where auto-prompt works.
  useEffect(() => {
    if (currentUser?.id && household?.id && !household.id.startsWith('hh_')) {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      // On iOS, only auto-subscribe if installed as standalone PWA
      if (!isIOSDevice || isStandalone) {
        import('./utils/notifications').then(({ subscribeUserToWebPush }) => {
          subscribeUserToWebPush(currentUser.id, household.id);
        });
      }
    }
  }, [currentUser?.id, household?.id]);


  // Supabase Realtime Presence & Live Online / Last Seen status
  useEffect(() => {
    if (!household.id || household.id.startsWith('hh_') || !currentUser?.id) return;

    updateUserPresenceInDB(currentUser.id, true);

    const presenceChannel = supabase.channel(`presence_hh_${household.id}`, {
      config: {
        presence: { key: currentUser.id }
      }
    });

    const syncPresenceState = () => {
      const state = presenceChannel.presenceState();
      if (partnerUser?.id && partnerUser.id !== 'usr_partner_waiting') {
        const partnerPresences = state[partnerUser.id] || [];
        const isPartnerOnline = partnerPresences.length > 0;
        const lastSeen = (partnerPresences[0] as any)?.last_seen || partnerUser.lastSeen;
        setPartnerPresence(isPartnerOnline, lastSeen);
      }
    };

    presenceChannel
      .on('presence', { event: 'sync' }, syncPresenceState)
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (partnerUser?.id && key === partnerUser.id) {
          setPartnerPresence(true, (newPresences[0] as any)?.last_seen || new Date().toISOString());
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (partnerUser?.id && key === partnerUser.id) {
          setPartnerPresence(false, new Date().toISOString());
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            last_seen: new Date().toISOString()
          });
        }
      });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserPresenceInDB(currentUser.id, true);
        presenceChannel.track({
          user_id: currentUser.id,
          name: currentUser.name,
          last_seen: new Date().toISOString()
        });
      } else {
        updateUserPresenceInDB(currentUser.id, false);
        presenceChannel.untrack();
      }
    };

    const handleBeforeUnload = () => {
      updateUserPresenceInDB(currentUser.id, false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
      updateUserPresenceInDB(currentUser.id, false);
    };
  }, [household.id, currentUser?.id, partnerUser?.id, setPartnerPresence]);

  // Supabase Realtime: Sync partner join & unpair events live & send push notification
  // Supabase Realtime: Sync partner join, task, chat & financial events live with partner push notifications
  useEffect(() => {
    if (!household.id || household.id.startsWith('hh_')) return;

    const channel = supabase.channel(`realtime_household_${household.id}`)
      .on('broadcast', { event: 'partner_left' }, async (payload: any) => {
        const leftName = payload?.payload?.userName || 'Your partner';
        sendPushNotification(
          'Partner Left Space 💔',
          `${leftName} left the household workspace.`,
          { tag: NOTIFICATION_TAGS.PARTNER_LEFT }
        );
        await fetchHouseholdData(household.id);
      })
      .on('broadcast', { event: 'partner_nudge' }, async (payload: any) => {
        const currentStore = useStore.getState();
        if (payload?.payload?.senderId !== currentStore.currentUser?.id) {
          const senderName = payload?.payload?.senderName || 'Partner';
          const goalName = payload?.payload?.goalName || 'Savings Goal';
          const title = 'Savings Goal Nudge! 🔔';
          const body = `${senderName} sent a friendly reminder to contribute towards "${goalName}"`;
          sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.SAVINGS_NUDGE });
          sendBackgroundPushToPartner(
            household.id,
            currentStore.currentUser?.id || '',
            title,
            body,
            '/budget',
            NOTIFICATION_TAGS.SAVINGS_NUDGE
          );
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);

        if (payload.eventType === 'INSERT') {
          const partnerName = payload.new?.name || 'Partner';
          sendPushNotification(
            'Partner Joined Space! 🎉',
            `${partnerName} connected to your workspace!`,
            { tag: NOTIFICATION_TAGS.PARTNER_JOINED }
          );
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'households',
        filter: `id=eq.${household.id}`
      }, async () => {
        await fetchHouseholdData(household.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `household_id=eq.${household.id}`
      }, async (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newMsg = payload.new;
          const currentStore = useStore.getState();

          const formattedMsg = {
            id: newMsg.id,
            senderName: newMsg.sender_name,
            content: newMsg.content,
            timestamp: new Date(newMsg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: newMsg.attachment_type ? {
              type: newMsg.attachment_type,
              title: newMsg.attachment_title || '',
              amount: newMsg.attachment_amount ? Number(newMsg.attachment_amount) : undefined,
              id: newMsg.attachment_ref_id || newMsg.id
            } : undefined
          };

          const isFromPartner = (newMsg.sender_id && newMsg.sender_id !== currentStore.currentUser?.id)
            && (newMsg.sender_name !== currentStore.currentUser?.name);

          const alreadyPresent = currentStore.chatMessages.some(m => m.id === newMsg.id);

          if (!alreadyPresent) {
            const optimisticIndex = currentStore.chatMessages.findIndex(
              m => m.senderName === newMsg.sender_name && m.content === newMsg.content && (m.id.startsWith('msg-') || m.id.length < 32)
            );

            if (optimisticIndex !== -1) {
              const updated = [...currentStore.chatMessages];
              updated[optimisticIndex] = formattedMsg;
              useStore.setState({ chatMessages: updated });
            } else {
              useStore.setState({ chatMessages: [...currentStore.chatMessages, formattedMsg] });
            }
          }

          // Trigger push notification and haptic vibration ONLY when receiving message/buzz from partner
          if (isFromPartner) {
            const isBuzz = newMsg.content && newMsg.content.includes('Buzzed');
            if (isBuzz) {
              const title = '⚡ Partner Buzz Alert!';
              const body = `${newMsg.sender_name} buzzed you! Tap to respond.`;
              sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.CHAT_BUZZ, requireInteraction: true });
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate([200, 100, 200, 100, 300]); } catch (e) {}
              }
            } else {
              const title = `💬 ${newMsg.sender_name}`;
              const body = newMsg.content || '';
              sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.CHAT_MESSAGE });
            }
          }
        } else {
          await fetchHouseholdData(household.id);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.new) {
          const currentStore = useStore.getState();
          const currentUserId = currentStore.currentUser?.id;
          const currentUserName = currentStore.currentUser?.name;
          const partnerName = currentStore.partnerUser?.name || 'Partner';
          const isFromPartner = (payload.new.created_by && payload.new.created_by !== currentUserId) ||
                                (payload.new.completed_by && payload.new.completed_by !== currentUserName);

          if (isFromPartner) {
            if (payload.eventType === 'INSERT') {
              const title = '📝 New Task Added';
              const body = `${partnerName} added: "${payload.new.title}"`;
              sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.TASK_ADD });
            } else if (payload.eventType === 'UPDATE' && payload.new.completed && !payload.old?.completed) {
              const title = '✅ Task Completed!';
              const body = `"${payload.new.title}" was completed by ${partnerName}`;
              sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.TASK_COMPLETE });
            }
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.eventType === 'INSERT' && payload?.new) {
          const currentStore = useStore.getState();
          const currentUserId = currentStore.currentUser?.id;
          const partnerName = currentStore.partnerUser?.name || 'Partner';
          const isFromPartner = payload.new.created_by ? payload.new.created_by !== currentUserId : (payload.new.paid_by_name && payload.new.paid_by_name !== currentStore.currentUser?.name);
          if (isFromPartner) {
            const typeLabel = payload.new.type === 'EXPENSE' ? 'expense' : 'income';
            const paidBy = payload.new.paid_by_name || partnerName;
            const title = `💰 ${typeLabel === 'expense' ? 'Expense' : 'Income'} Logged`;
            const body = `${paidBy} logged ${typeLabel}: "${payload.new.title}"`;
            sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.TRANSACTION });
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'recurring_bills'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
          if (payload?.eventType === 'UPDATE' && payload?.new?.status === 'PAID' && payload?.old?.status !== 'PAID') {
            const currentStore = useStore.getState();
            const partnerName = currentStore.partnerUser?.name || 'Partner';
            const paidBy = payload.new.paid_by_name || payload.new.paid_by;
            const isFromPartner = paidBy && paidBy !== currentStore.currentUser?.name;
            if (isFromPartner) {
              const title = '🧾 Bill Paid!';
              const body = `"${payload.new.title}" was marked paid by ${partnerName}`;
              sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.RECURRING_BILL });
            }
          }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'debt_accounts'
      }, async () => {
        await fetchHouseholdData(household.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'savings_goals'
      }, async () => {
        await fetchHouseholdData(household.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'income_streams'
      }, async () => {
        await fetchHouseholdData(household.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quick_notes'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.eventType === 'INSERT' && payload?.new) {
          const currentStore = useStore.getState();
          const currentUserId = currentStore.currentUser?.id;
          const partnerName = currentStore.partnerUser?.name || 'Partner';
          const isFromPartner = payload.new.created_by ? payload.new.created_by !== currentUserId : (payload.new.author_name && payload.new.author_name !== currentStore.currentUser?.name);
          if (isFromPartner) {
            const title = '📓 New Quick Note';
            const body = `${payload.new.author_name || partnerName}: "${payload.new.text}"`;
            sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.QUICK_NOTE });
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'debt_payments'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.eventType === 'INSERT' && payload?.new) {
          const currentStore = useStore.getState();
          const partnerName = currentStore.partnerUser?.name || 'Partner';
          const isFromPartner = payload.new.paid_by && payload.new.paid_by !== currentStore.currentUser?.name;
          if (isFromPartner) {
            const title = '💳 Debt Payment Made';
            const body = `${payload.new.paid_by || partnerName} made a debt payment`;
            sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.DEBT_PAYMENT });
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'savings_contributions'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.eventType === 'INSERT' && payload?.new) {
          const currentStore = useStore.getState();
          const partnerName = currentStore.partnerUser?.name || 'Partner';
          const isFromPartner = payload.new.contributor_name && payload.new.contributor_name !== currentStore.currentUser?.name;
          if (isFromPartner) {
            const title = '🎯 Savings Deposit Made';
            const body = `${payload.new.contributor_name || partnerName} added to a savings goal!`;
            sendPushNotification(title, body, { tag: NOTIFICATION_TAGS.SAVINGS_DEPOSIT });
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_folders'
      }, async () => {
        await fetchHouseholdData(household.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contextual_comments'
      }, async (payload: any) => {
        await fetchHouseholdData(household.id);
        if (payload?.eventType === 'INSERT' && payload?.new) {
          const currentStore = useStore.getState();
          const isFromPartner = payload.new.author_name && payload.new.author_name !== currentStore.currentUser?.name;
          if (isFromPartner) {
            sendPushNotification(
              '💬 New Inline Comment',
              `${payload.new.author_name}: "${payload.new.text}"`,
              { tag: NOTIFICATION_TAGS.CHAT_MESSAGE }
            );
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [household.id]);

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isInitializingApp, setIsInitializingApp] = useState(true);

  // Register Web Push for auto-subscribe on non-iOS devices (iOS uses Settings toggle)
  useEffect(() => {
    if (currentUser?.id && household?.id && !household.id.startsWith('hh_')) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (!isIOS || isStandalone) {
        import('./utils/notifications').then(({ subscribeUserToWebPush }) => {
          subscribeUserToWebPush(currentUser.id, household.id);
        });
      }
    }
  }, [currentUser?.id, household?.id]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);

        const { data: prof } = await supabase.from('profiles').select('household_id, name').eq('id', session.user.id).maybeSingle();
        if (prof?.name) {
          useStore.setState((state) => ({
            currentUser: { ...state.currentUser, id: session.user.id, name: prof.name }
          }));
        }
        if (prof?.household_id) {
          await fetchHouseholdData(prof.household_id);
          // Auto-subscribe for non-iOS (iOS needs user gesture via Settings toggle)
          const isIOSCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
          const isStandaloneCheck = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
          if (!isIOSCheck || isStandaloneCheck) {
            import('./utils/notifications').then(({ subscribeUserToWebPush }) => {
              subscribeUserToWebPush(session.user.id, prof.household_id);
            });
          }
          setOnboardingCompleted(true);
          setCurrentView('dashboard');
        } else {
          setOnboardingCompleted(false);
          setCurrentView('onboarding');
        }
      }
      if (isMounted) setIsInitializingApp(false);
    }).catch((err) => {
      console.warn('Auth getSession notice:', err);
      if (isMounted) setIsInitializingApp(false);
    });

    if (window.location.hash.includes('type=recovery') || window.location.pathname.includes('reset-password')) {
      setResetPasswordModalOpen(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        if (event === 'SIGNED_IN') {
          const { data: prof } = await supabase.from('profiles').select('household_id, name').eq('id', session.user.id).maybeSingle();
          if (prof?.name) {
            useStore.setState((state) => ({
              currentUser: { ...state.currentUser, id: session.user.id, name: prof.name }
            }));
          }
          if (prof?.household_id) {
            await fetchHouseholdData(prof.household_id);
            // Auto-subscribe for non-iOS (iOS needs user gesture)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
            if (!isIOS || isStandalone) {
              import('./utils/notifications').then(({ subscribeUserToWebPush }) => {
                subscribeUserToWebPush(session.user.id, prof.household_id);
              });
            }
            setOnboardingCompleted(true);
            setCurrentView('dashboard');
          } else {
            setOnboardingCompleted(false);
            setCurrentView('onboarding');
          }
        }
      }
      if (event === 'PASSWORD_RECOVERY') {
        setResetPasswordModalOpen(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Strict RBAC Route Guard: Lock main app routes until onboarding key flow is completed
  useEffect(() => {
    if (!isOnboardingCompleted && currentView !== 'onboarding') {
      setCurrentView('onboarding');
    }
  }, [isOnboardingCompleted, currentView, setCurrentView]);

  // Save New Password Handler
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordUpdated(true);
        setTimeout(() => {
          setResetPasswordModalOpen(false);
          setPasswordUpdated(false);
          setNewPassword('');
          setOnboardingCompleted(true);
          setCurrentView('dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'tasks': return <TasksView />;
      case 'budget': return <BudgetView />;
      case 'chat': return <ChatView />;
      case 'onboarding': return <OnboardingView />;
      case 'invite': return <InviteView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  if (isInitializingApp) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center space-y-4 p-6 select-none">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-3xl bg-[#EF713F] text-white flex items-center justify-center shadow-lg"
        >
          <img src="/logo.svg" alt="CoupleTODO" className="w-10 h-10 object-contain" />
        </motion.div>
        <div className="text-center space-y-1">
          <h2 className="font-display text-lg font-bold text-[#231F1E]">Couples Studio</h2>
          <p className="text-xs font-mono text-[#6B6560]">Syncing workspace & partner status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#231F1E] text-[#231F1E] font-sans antialiased selection:bg-[#EF713F] selection:text-white flex flex-col overflow-x-hidden">

      {/* Typewriter & Color Woosh App Entrance Experience */}
      <WelcomeWoosh />

      {/* iOS Install Prompt Banner (only shows when not installed) */}
      <InstallPromptBanner />

      {/* App Workspace Canvas */}
      <motion.div
        animate={{
          x: isNotificationsOpen ? -320 : 0,
          scale: isNotificationsOpen ? 0.96 : 1,
          borderRadius: isNotificationsOpen ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
        className="flex-1 flex flex-col min-h-screen bg-[#FBF9F5] origin-left overflow-hidden"
      >
        {/* Top Application Header */}
        <TopBar />

        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Liquid Glass Navigation Bar */}
        <MobileNav />
      </motion.div>

      {/* Slide-out Notifications Drawer */}
      <NotificationsDrawer />

      {/* Global Modals & Drawers */}
      <QuickActionSheet />
      <SettleUpModal />
      <ContextualThreadDrawer />
      <QuickNoteModal />
      <SettingsModal />

      {/* SET NEW PASSWORD MODAL (Triggered when clicking recovery link in email) */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer" onClick={() => setResetPasswordModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border-0"
          >
            <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
              <h3 className="font-bold text-xl text-[#231F1E]">Set New Password</h3>
              <button
                onClick={() => setResetPasswordModalOpen(false)}
                className="text-[#6B6560] hover:text-[#231F1E] border-0 bg-transparent cursor-pointer"
              >
                <CloseCircle size={22} />
              </button>
            </div>

            {passwordUpdated ? (
              <div className="p-6 rounded-3xl bg-[#EBF3ED] text-center space-y-3 border-0">
                <TickCircle size={40} variant="Bold" className="text-[#4A7C59] mx-auto" />
                <h4 className="font-bold text-lg text-[#231F1E]">Password Updated! 🎉</h4>
                <p className="text-xs text-[#6B6560]">Your password has been updated. Redirecting to workspace...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                    ⚠️ {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase">New Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 6 characters..."
                      className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-3.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
                >
                  {isUpdatingPassword ? (
                    <span>Saving New Password...</span>
                  ) : (
                    <>
                      <span>Save New Password & Continue</span>
                      <ArrowRight size={18} variant="Linear" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
};
