import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
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
  const { currentView, isNotificationsOpen } = useStore();

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

      {/* App Workspace Canvas - Softly Pushed to the Left with Matching Spring Easing */}
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

          {/* Main Content Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Navigation & Isolated Floating Action Circle */}
        <MobileNav />
      </motion.div>

      {/* Soft Slide-over Right Notifications Drawer */}
      <NotificationsDrawer />

      {/* Global Modals & Drawers */}
      <QuickActionSheet />
      <SettleUpModal />
      <ContextualThreadDrawer />
      <QuickNoteModal />
      <SettingsModal />
    </div>
  );
}
