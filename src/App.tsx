import React, { useEffect } from 'react';
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

import { QuickActionSheet } from './components/views/QuickActionSheet';
import { SettleUpModal } from './components/views/SettleUpModal';
import { ContextualThreadDrawer } from './components/views/ContextualThreadDrawer';
import { QuickNoteModal } from './components/views/QuickNoteModal';
import { SettingsModal } from './components/views/SettingsModal';
import { NotificationsDrawer } from './components/views/NotificationsDrawer';
import { WelcomeWoosh } from './components/ui/WelcomeWoosh';

export default function App() {
  const { currentView, setCurrentView, setSession, isNotificationsOpen } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        if (currentView === 'onboarding') setCurrentView('dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        if (currentView === 'onboarding') setCurrentView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <div className="min-h-screen bg-[#231F1E] text-[#231F1E] font-sans antialiased selection:bg-[#EF713F] selection:text-white flex flex-col overflow-x-hidden">
      
      {/* Typewriter & Color Woosh App Entrance Experience */}
      <WelcomeWoosh />

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

    </div>
  );
};
