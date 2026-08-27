import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { DailyInsightPage } from './DailyInsightPage';

export const WelcomeWoosh: React.FC = () => {
  const { currentUser } = useStore();
  const [isWooshVisible, setIsWooshVisible] = useState(true);
  const [showInsightPage, setShowInsightPage] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Compute dynamic greeting based on time of day and current user name
  const timeGreeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const userName = (currentUser?.name && currentUser.name !== 'usr_me')
    ? currentUser.name
    : '';

  const fullGreeting = userName
    ? `${timeGreeting}, ${userName} ✨`
    : `${timeGreeting} ✨`;

  useEffect(() => {
    // Slower, tactile typewriter effect (65ms per character)
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= fullGreeting.length) {
        setTypedText(fullGreeting.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 65);

    // Initial loading woosh dismiss timer
    const dismissTimer = setTimeout(() => {
      setIsWooshVisible(false);

      // Check if Daily Insight has already been shown today
      const todayStr = new Date().toISOString().split('T')[0];
      const lastShownDate = localStorage.getItem('coupletodo_last_daily_insight_date');

      if (lastShownDate !== todayStr) {
        setShowInsightPage(true);
      }
    }, 2800);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(dismissTimer);
    };
  }, [fullGreeting]);

  return (
    <>
      <AnimatePresence>
        {isWooshVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[110] bg-[#FBF9F5] flex flex-col items-center justify-center overflow-hidden select-none"
          >
            {/* Animated Liquid Color Woosh Blobs */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -45 }}
              animate={{ scale: 2, opacity: 0.35, rotate: 45 }}
              exit={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#EF713F] via-[#E9C277] to-[#BEABD8] blur-3xl"
            />

            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: 45 }}
              animate={{ scale: 2.2, opacity: 0.3, rotate: -45 }}
              exit={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.1 }}
              className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#BEABD8] via-[#E9C277] to-[#EF713F] blur-3xl"
            />

            {/* Typewriter Greeting Container */}
            <div className="relative z-10 text-center space-y-4 px-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-zodiak text-3xl sm:text-5xl font-extrabold text-[#231F1E] tracking-tight min-h-[60px]"
              >
                {typedText}
                <span className="inline-block w-1.5 h-7 sm:h-9 ml-1 bg-[#EF713F] animate-pulse rounded-full align-middle" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="font-mono text-xs text-[#6B6560] tracking-widest uppercase"
              >
                Connecting Household Sync...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Review Insight Page - Only Shown ONCE Per Day After Woosh */}
      <AnimatePresence>
        {!isWooshVisible && showInsightPage && (
          <DailyInsightPage onFinish={() => setShowInsightPage(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
