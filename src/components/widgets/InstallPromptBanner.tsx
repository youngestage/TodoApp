import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isIOS, isStandaloneMode } from '../../utils/notifications';
import { CloseCircle } from 'iconsax-react';

/**
 * InstallPromptBanner
 * 
 * Shown to iOS Safari users who haven't yet installed the PWA.
 * Push notifications on iOS REQUIRE the app to be added to Home Screen.
 * This banner guides them through the process.
 */
export function InstallPromptBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when NOT in standalone mode
    const dismissed = sessionStorage.getItem('ct_install_prompt_dismissed');
    if (dismissed) return;

    // Show if on iOS and not installed as standalone PWA
    const iosNotInstalled = isIOS() && !isStandaloneMode();
    if (iosNotInstalled) {
      // Delay slightly so it doesn't flash on mount
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('ct_install_prompt_dismissed', '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-20 left-4 right-4 z-50 select-none"
        >
          <div className="bg-[#231F1E] text-white rounded-3xl p-4 shadow-2xl flex items-start gap-3">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#EF713F] flex items-center justify-center">
              <img src="/icon-192.png" alt="App" className="w-7 h-7 object-contain rounded-xl" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white leading-tight mb-0.5">
                Enable Push Notifications
              </p>
              <p className="text-xs text-white/70 leading-snug">
                To get notified when your partner does something, add this app to your{' '}
                <span className="text-[#EF713F] font-semibold">Home Screen</span> first.
              </p>
              {/* Step-by-step */}
              <div className="mt-2 flex items-center gap-2 text-[10px] text-white/60 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="text-white/80">1.</span> Tap
                  <svg className="w-3.5 h-3.5 text-white/80 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </span>
                <span className="text-white/40">→</span>
                <span className="flex items-center gap-1 text-white/80 font-medium">
                  2. "Add to Home Screen"
                </span>
                <span className="text-white/40">→</span>
                <span className="text-white/80">3. Open app from Home Screen</span>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="shrink-0 text-white/50 hover:text-white transition-colors p-0.5 bg-transparent border-0"
            >
              <CloseCircle size={20} />
            </button>
          </div>

          {/* Downward pointing arrow to indicate it's a bottom action */}
          <div className="flex justify-center mt-1.5">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#231F1E]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
