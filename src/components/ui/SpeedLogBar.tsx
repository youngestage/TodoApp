import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Add, Microphone, TickCircle } from 'iconsax-react';

export const SpeedLogBar: React.FC = () => {
  const { addTransaction, addTask, addQuickNote, currentUser } = useStore();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleQuickLog = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = inputText.trim();
    if (!raw) return;

    // Smart Auto-Parsing
    const numberMatch = raw.match(/(?:₦|N|naira)?\s*([\d,]+)/i);

    if (numberMatch && (raw.includes('₦') || raw.toLowerCase().includes('naira') || raw.toLowerCase().includes('for') || raw.toLowerCase().includes('via') || raw.toLowerCase().includes('opay') || raw.toLowerCase().includes('kuda'))) {
      // 1. Auto-Parse as Expense
      const amountStr = numberMatch[1].replace(/,/g, '');
      const amount = parseInt(amountStr, 10) || 5000;
      const title = raw.replace(/(?:₦|N|naira)?\s*[\d,]+/gi, '').replace(/\b(for|via|opay|kuda|paid|spent)\b/gi, '').trim() || 'Quick Expense';

      addTransaction({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        amount,
        type: 'EXPENSE',
        category: 'Expenses',
        paidBy: currentUser.name as 'Leslie' | 'Asa',
        account: 'Opay (Leslie)',
        isShared: true,
        date: 'Just now (Speed Log)'
      });

      showFeedback(`Logged ₦${amount.toLocaleString()} Expense`);
    } else if (/\b(remind|buy|pick up|pay|book|call|task|check|schedule)\b/i.test(raw)) {
      // 2. Auto-Parse as Task
      addTask({
        title: raw.charAt(0).toUpperCase() + raw.slice(1),
        category: 'Home',
        isJoint: true,
        assignedToName: 'Both',
        dueDate: 'Today',
        priority: 'High'
      });

      showFeedback('Added Household Task');
    } else {
      // 3. Fallback as Quick Note
      addQuickNote(raw);
      showFeedback('Saved Quick Note');
    }

    setInputText('');
  };

  const handleMicClick = () => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } catch (err) {
        setIsListening(false);
      }
    } else {
      setInputText('₦5,000 for groceries via Opay');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border-0 shadow-none space-y-2 select-none">
      
      <form onSubmit={handleQuickLog} className="flex items-center space-x-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Type or dictate: "₦5,000 for groceries" or "Remind Asa to buy milk"...'
            className="w-full px-4 py-2.5 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] placeholder:text-[#6B6560]/70 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30 border-0 font-sans transition-all pr-10"
          />

          {/* Voice Dictation Button */}
          <button
            type="button"
            onClick={handleMicClick}
            className={`absolute right-2.5 p-1.5 rounded-xl transition-colors cursor-pointer border-0 ${
              isListening ? 'bg-[#EF713F] text-white animate-pulse' : 'text-[#6B6560] hover:text-[#231F1E]'
            }`}
            title="Voice Dictate"
          >
            <Microphone size={16} variant="Linear" />
          </button>
        </div>

        {/* Speed Log CTA Button */}
        <button
          type="submit"
          className="py-2.5 px-4 rounded-2xl bg-[#231F1E] hover:bg-black text-white text-xs font-bold transition-all border-0 cursor-pointer shrink-0 flex items-center space-x-1"
        >
          <span>Log</span>
          <Add size={16} variant="Linear" />
        </button>
      </form>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#EBF3ED] text-[#4A7C59] text-xs font-semibold font-mono animate-fade-in">
          <TickCircle size={14} variant="Bold" />
          <span>{feedbackMsg}</span>
        </div>
      )}

    </div>
  );
};
