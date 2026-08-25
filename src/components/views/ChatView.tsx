import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Avatar } from '../ui/Avatar';
import {
  Send2,
  Heart,
  Wallet3,
  TaskSquare,
  Microphone,
  Add,
  ArrowLeft,
  MessageText,
  Flash,
  TickCircle
} from 'iconsax-react';

export const ChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, sendBuzz, currentUser, partnerUser, addTransaction, addTask, setFullChatActive } = useStore();
  
  // State: selectedChat null = Conversations List; 'partner' = Full-screen Partner Chat
  const [selectedChat, setSelectedChat] = useState<'partner' | 'household' | 'travel' | null>(null);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [buzzCooldown, setBuzzCooldown] = useState(0);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync full chat active state with store so MobileNav hides when in full chat
  useEffect(() => {
    setFullChatActive(selectedChat !== null);
    return () => setFullChatActive(false);
  }, [selectedChat, setFullChatActive]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // Handle Buzz Cooldown timer
  useEffect(() => {
    if (buzzCooldown <= 0) return;
    const timer = setInterval(() => setBuzzCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [buzzCooldown]);

  const handleSendBuzz = () => {
    if (buzzCooldown > 0) return;
    sendBuzz();
    setBuzzCooldown(5); // 5 second cooldown
    
    // Trigger subtle screen micro-shake
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 800);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = inputText.trim();
    if (!raw) return;
    sendChatMessage(raw);
    setInputText('');
    setShowAttachMenu(false);
  };

  const handleVoiceDictate = () => {
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
      setInputText('I love you babe!');
    }
  };

  const handleAttachExpense = () => {
    addTransaction({
      title: 'Dinner at Chef Alain',
      amount: 35000,
      type: 'EXPENSE',
      category: 'Expenses',
      paidBy: 'Leslie',
      account: 'Opay (Leslie)',
      isShared: true,
      date: 'Just now'
    });
    sendChatMessage('I logged ₦35,000 for our anniversary dinner under Expenses 🍷', {
      type: 'EXPENSE',
      title: 'Dinner at Chef Alain',
      amount: 35000,
      id: `tx-${Date.now()}`
    });
    setShowAttachMenu(false);
  };

  const handleAttachTask = () => {
    addTask({
      title: 'Pick up organic fruits from market',
      category: 'Shopping',
      isJoint: true,
      assignedToName: 'Both',
      dueDate: 'Tomorrow',
      priority: 'Medium'
    });
    sendChatMessage('Can you check off your side of the grocery task when you get to the market? 🛒', {
      type: 'TASK',
      title: 'Pick up organic fruits from market',
      id: `task-${Date.now()}`
    });
    setShowAttachMenu(false);
  };

  const conversationsList = [
    {
      id: 'partner',
      title: partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name,
      subtitle: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content : 'No messages yet. Say something sweet...',
      time: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].timestamp : '',
      unread: 0,
      avatar: partnerUser.avatarUrl
    }
  ];

  return (
    <div className="select-none max-w-4xl mx-auto">
      
      {/* 1. Conversations Inbox List View */}
      {selectedChat === null ? (
        <motion.div
          key="inbox-list"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-5 pb-20 md:pb-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
            <div className="space-y-0.5">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
                Conversations
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6560]">
                Private couple chat, household discussions & partner Buzz alerts
              </p>
            </div>
          </div>

          {/* Conversations Cards List */}
          <div className="space-y-3">
            {conversationsList.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id as any)}
                className="w-full bg-white rounded-3xl p-5 border-0 shadow-none flex items-center justify-between text-left hover:bg-white/90 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                  <div className="relative shrink-0">
                    <Avatar name={conv.title} src={conv.avatar} size="md" />
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#231F1E] group-hover:text-[#EF713F] transition-colors truncate">
                        {conv.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#6B6560]">{conv.time}</span>
                    </div>

                    <p className="text-xs text-[#6B6560] truncate font-sans">
                      {conv.subtitle}
                    </p>
                  </div>
                </div>

                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#EF713F] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        /* 2. Dedicated Full-Screen Chat Room Experience */
        <motion.div
          key="full-screen-chat"
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            x: isScreenShaking ? [0, -4, 4, -3, 3, 0] : 0
          }}
          exit={{ opacity: 0, y: 12 }}
          transition={{
            x: { duration: 0.3, repeat: 1 },
            default: { type: 'spring', stiffness: 240, damping: 25 }
          }}
          className="fixed inset-0 z-50 bg-[#FBF9F5] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Full-Screen Chat Header */}
          <div className="bg-white px-4 sm:px-8 py-3.5 border-0 shadow-sm flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 rounded-full text-[#6B6560] hover:text-[#231F1E] hover:bg-black/5 transition-colors cursor-pointer border-0"
                aria-label="Back to Conversations Inbox"
              >
                <ArrowLeft size={22} variant="Linear" />
              </button>

              <div className="flex items-center space-x-3">
                <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} size="md" />
                <div>
                  <h2 className="font-bold text-base text-[#231F1E] flex items-center space-x-1">
                    <span>{partnerUser.name}</span>
                  </h2>
                  <p className="text-[11px] text-[#6B6560] font-mono">
                    online
                  </p>
                </div>
              </div>
            </div>

            {/* Top Header Actions: Lean & Minimal Buzz Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSendBuzz}
                disabled={buzzCooldown > 0}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all border-0 cursor-pointer flex items-center space-x-1.5 ${
                  buzzCooldown > 0
                    ? 'bg-[#FBF9F5] text-[#6B6560] opacity-60 cursor-not-allowed'
                    : 'bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E]'
                }`}
                title="Buzz partner"
              >
                <Flash size={15} variant="Linear" className="text-[#EF713F]" />
                <span>{buzzCooldown > 0 ? `Buzzed (${buzzCooldown}s)` : `Buzz ${partnerUser.name}`}</span>
              </button>
            </div>
          </div>

          {/* Full-Screen Scrollable Message Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-2 max-w-4xl w-full mx-auto">
            
            {/* Timestamp Separator */}
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-white text-[10px] font-mono text-[#6B6560] border-0 shadow-xs">
                Today
              </span>
            </div>

            {chatMessages.map((msg, idx) => {
              const isMe = msg.senderName === currentUser.name;

              // Check if next message is from the same sender AND has the exact same timestamp
              const nextMsg = chatMessages[idx + 1];
              const isNextSameGroup = nextMsg && nextMsg.senderName === msg.senderName && nextMsg.timestamp === msg.timestamp;
              const showTimestamp = !isNextSameGroup;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-6 shrink-0">
                      {showTimestamp && (
                        <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} size="sm" className="mb-1" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[82%] sm:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* Message Content Bubble (Clean, Minimal Styling) */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-3xl text-sm font-sans leading-relaxed border-0 ${
                        isMe
                          ? 'bg-[#EF713F] text-white rounded-br-md'
                          : 'bg-white text-[#231F1E] rounded-bl-md shadow-xs'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attachment Card (Expense / Task) */}
                      {msg.attachment && (
                        <div
                          className={`mt-2.5 p-2.5 rounded-2xl border-0 text-xs font-mono flex items-center justify-between ${
                            isMe ? 'bg-white/15 text-white' : 'bg-[#FBF9F5] text-[#231F1E]'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            {msg.attachment.type === 'EXPENSE' ? (
                              <Wallet3 size={16} variant="Linear" className={isMe ? 'text-white' : 'text-[#EF713F]'} />
                            ) : (
                              <TaskSquare size={16} variant="Linear" className={isMe ? 'text-white' : 'text-[#8964B3]'} />
                            )}
                            <span className="font-semibold truncate">{msg.attachment.title}</span>
                          </div>

                          {msg.attachment.amount && (
                            <span className="font-extrabold shrink-0">
                              ₦{msg.attachment.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Read Indicator */}
                    {showTimestamp && (
                      <div className={`flex items-center space-x-1 text-[10px] font-mono text-[#6B6560] pt-0.5 ${
                        isMe ? 'justify-end pr-1' : 'justify-start pl-1'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <TickCircle size={12} variant="Bold" className="text-[#4A7C59]" />}
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Full Chat Input Bar */}
          <div className="bg-white p-3 sm:p-4 border-0 shadow-lg shrink-0 z-10 space-y-2 max-w-4xl w-full mx-auto sm:rounded-t-3xl">
            
            {/* Popup Attachment Menu */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="p-2 rounded-2xl bg-[#FBF9F5] space-y-1 border-0"
                >
                  <button
                    onClick={handleAttachExpense}
                    className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-white text-xs font-semibold text-[#231F1E] transition-colors border-0 cursor-pointer"
                  >
                    <Wallet3 size={18} variant="Bold" className="text-[#EF713F]" />
                    <span>Attach Logged Expense (₦35,000 Dinner)</span>
                  </button>

                  <button
                    onClick={handleAttachTask}
                    className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl hover:bg-white text-xs font-semibold text-[#231F1E] transition-colors border-0 cursor-pointer"
                  >
                    <TaskSquare size={18} variant="Bold" className="text-[#8964B3]" />
                    <span>Attach Joint Task (Organic Produce Market)</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form Bar */}
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#6B6560] hover:text-[#231F1E] transition-colors cursor-pointer border-0 shrink-0"
                title="Attach Expense or Task"
              >
                <Add size={20} variant="Linear" className={showAttachMenu ? 'rotate-45 text-[#EF713F]' : ''} />
              </button>

              {/* Text Input */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${partnerUser.name}...`}
                  className="w-full pl-4 pr-10 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] placeholder:text-[#6B6560]/70 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30 border-0 font-sans transition-all"
                />

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={handleVoiceDictate}
                  className={`absolute right-2.5 p-1.5 rounded-xl transition-colors cursor-pointer border-0 ${
                    isListening ? 'bg-[#EF713F] text-white animate-pulse' : 'text-[#6B6560] hover:text-[#231F1E]'
                  }`}
                  title="Voice Dictate"
                >
                  <Microphone size={18} variant="Linear" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-3 rounded-2xl transition-all border-0 cursor-pointer shrink-0 flex items-center justify-center ${
                  inputText.trim()
                    ? 'bg-[#EF713F] text-white shadow-md hover:bg-[#D95220]'
                    : 'bg-[#EFECE6] text-[#6B6560] cursor-not-allowed'
                }`}
              >
                <Send2 size={18} variant="Bold" />
              </button>
            </form>

          </div>
        </motion.div>
      )}

    </div>
  );
};
