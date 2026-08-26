import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Avatar } from '../ui/Avatar';
import { formatLastSeen } from '../../utils/dateUtils';
import {
  Send2,
  Wallet3,
  TaskSquare,
  Microphone,
  Add,
  ArrowLeft,
  MessageText,
  Flash,
  TickCircle
} from 'iconsax-react';

const ReplyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    sendBuzz,
    currentUser,
    partnerUser,
    tasks,
    transactions,
    contextualComments,
    openContextualThread,
    setCurrentView,
    setFullChatActive
  } = useStore();

  // State: selectedChat null = Conversations List; 'partner' = Full-screen Partner Chat
  const [selectedChat, setSelectedChat] = useState<'partner' | 'household' | 'travel' | null>(null);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachTab, setAttachTab] = useState<'EXPENSE' | 'TASK'>('EXPENSE');
  const [selectedAttachment, setSelectedAttachment] = useState<{
    type: 'EXPENSE' | 'TASK';
    title: string;
    amount?: number;
    id: string;
  } | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);

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
    setBuzzCooldown(5);
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 800);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = inputText.trim();
    if (!raw && !selectedAttachment) return;

    const replyToPayload = replyingToMessage
      ? {
          id: replyingToMessage.id,
          senderName: replyingToMessage.senderName,
          content: replyingToMessage.content
        }
      : undefined;

    sendChatMessage(
      raw || (selectedAttachment ? `Attached: ${selectedAttachment.title}` : ''),
      selectedAttachment || undefined,
      replyToPayload
    );
    setInputText('');
    setSelectedAttachment(null);
    setReplyingToMessage(null);
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

  // Build dynamic conversations list: Main Chat + Active Inline Thread Discussions
  // Group contextual comments by targetId
  const threadMap = new Map<string, { comments: typeof contextualComments; itemTitle: string; type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL' }>();

  contextualComments.forEach(comment => {
    if (!threadMap.has(comment.targetId)) {
      let itemTitle = 'Inline Discussion';
      const targetTypeUpper = comment.targetType ? comment.targetType.toUpperCase() : 'TASK';
      if (targetTypeUpper === 'TASK') {
        const t = tasks.find(x => x.id === comment.targetId);
        if (t) itemTitle = t.title;
      } else if (targetTypeUpper === 'TRANSACTION') {
        const tx = transactions.find(x => x.id === comment.targetId);
        if (tx) itemTitle = tx.title;
      }
      threadMap.set(comment.targetId, {
        comments: [],
        itemTitle,
        type: targetTypeUpper as any
      });
    }
    threadMap.get(comment.targetId)!.comments.push(comment);
  });

  const inlineThreadConvs = Array.from(threadMap.entries()).map(([targetId, info]) => {
    const lastComment = info.comments[info.comments.length - 1];
    return {
      id: `thread-${targetId}`,
      isInlineThread: true,
      threadItem: { type: info.type, id: targetId, title: info.itemTitle },
      title: `💬 ${info.itemTitle}`,
      subtitle: lastComment ? `${lastComment.authorName}: ${lastComment.text}` : 'Inline conversation',
      time: lastComment?.timestamp || '',
      avatar: '/logo.svg'
    };
  });

  const mainChatConv = {
    id: 'partner',
    isInlineThread: false,
    threadItem: undefined as { type: 'TASK' | 'TRANSACTION' | 'RECURRING_BILL'; id: string; title: string } | undefined,
    title: partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name,
    subtitle: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content : 'No messages yet. Say something sweet...',
    time: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].timestamp : '',
    avatar: partnerUser.avatarUrl
  };

  const conversationsList = [mainChatConv, ...inlineThreadConvs];

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
                Private couple chat & attached item threads
              </p>
            </div>
          </div>

          {/* Conversations Cards List */}
          <div className="space-y-3">
            {conversationsList.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  if (conv.isInlineThread && conv.threadItem) {
                    openContextualThread(conv.threadItem);
                  } else {
                    setSelectedChat('partner');
                  }
                }}
                className="w-full bg-white rounded-3xl p-5 border-0 shadow-none flex items-center justify-between text-left hover:bg-white/90 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                  <div className="relative shrink-0">
                    {conv.isInlineThread ? (
                      <div className="w-10 h-10 rounded-2xl bg-[#F6F3FA] text-[#8964B3] flex items-center justify-center font-bold">
                        <MessageText size={20} variant="Bold" />
                      </div>
                    ) : (
                      <Avatar name={conv.title} src={conv.avatar} size="md" isOnline={partnerUser.isOnline} />
                    )}
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
                <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} size="md" isOnline={partnerUser.isOnline} />
                <div>
                  <h2 className="font-bold text-base text-[#231F1E] flex items-center space-x-1">
                    <span>{partnerUser.name}</span>
                  </h2>
                  <p className="text-[11px] text-[#6B6560] font-mono">
                    {formatLastSeen(partnerUser.lastSeen, partnerUser.isOnline)}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Header Actions: Buzz Button */}
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
              const nextMsg = chatMessages[idx + 1];
              const isNextSameGroup = nextMsg && nextMsg.senderName === msg.senderName && nextMsg.timestamp === msg.timestamp;
              const showTimestamp = !isNextSameGroup;

              return (
                <motion.div
                  key={msg.id}
                  id={`msg-${msg.id}`}
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
                    
                    {/* Draggable Message Content Bubble (Swipe Right to Reply) */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 65 }}
                      dragElastic={0.2}
                      dragSnapToOrigin={true}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 35) {
                          setReplyingToMessage(msg);
                          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                            try { navigator.vibrate(25); } catch {}
                          }
                        }
                      }}
                      className={`p-3.5 sm:p-4 rounded-3xl text-sm font-sans leading-relaxed border-0 relative cursor-grab active:cursor-grabbing touch-pan-y ${
                        isMe
                          ? 'bg-[#EF713F] text-white rounded-br-md'
                          : 'bg-white text-[#231F1E] rounded-bl-md shadow-xs'
                      }`}
                    >
                      {/* Quoted Message Reply Box */}
                      {msg.replyTo && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetEl = document.getElementById(`msg-${msg.replyTo?.id}`);
                            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`mb-2 p-2 rounded-2xl text-xs font-sans border-l-3 cursor-pointer transition-all ${
                            isMe
                              ? 'bg-black/20 text-white border-white/90 hover:bg-black/30'
                              : 'bg-[#FBF9F5] text-[#231F1E] border-[#EF713F] hover:bg-gray-100'
                          }`}
                          title="Click to view original message"
                        >
                          <span className={`font-bold block text-[10px] ${isMe ? 'text-white/90' : 'text-[#EF713F]'}`}>
                            Replying to {msg.replyTo.senderName}
                          </span>
                          <span className="truncate block text-[11px] opacity-90 font-medium">
                            {msg.replyTo.content}
                          </span>
                        </div>
                      )}

                      <p>{msg.content}</p>

                      {/* Attachment Card (Clickable to jump directly to Tasks or Budget view) */}
                      {msg.attachment && (
                        <div
                          onClick={() => {
                            if (msg.attachment) {
                              if (msg.attachment.type === 'EXPENSE') {
                                setCurrentView('budget');
                              } else {
                                setCurrentView('tasks');
                              }
                            }
                          }}
                          className={`mt-2.5 p-3 rounded-2xl border-0 text-xs font-mono flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                            isMe ? 'bg-white/20 text-white' : 'bg-[#FBF9F5] text-[#231F1E]'
                          }`}
                          title={`Click to view ${msg.attachment.type.toLowerCase()} in ${msg.attachment.type === 'EXPENSE' ? 'Budget' : 'Tasks'}`}
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            {msg.attachment.type === 'EXPENSE' ? (
                              <Wallet3 size={18} variant="Linear" className={isMe ? 'text-white' : 'text-[#EF713F]'} />
                            ) : (
                              <TaskSquare size={18} variant="Linear" className={isMe ? 'text-white' : 'text-[#8964B3]'} />
                            )}
                            <div className="truncate">
                              <span className="font-semibold block truncate">{msg.attachment.title}</span>
                              <span className="text-[10px] opacity-80 font-sans">Tap to view item ↗</span>
                            </div>
                          </div>

                          {msg.attachment.amount && (
                            <span className="font-extrabold shrink-0">
                              ₦{msg.attachment.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>

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
            
            {/* Reply Draft Banner (WhatsApp / Instagram Style) */}
            <AnimatePresence>
              {replyingToMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 6, height: 0 }}
                  className="flex items-center justify-between bg-[#FBF9F5] p-2.5 rounded-2xl text-xs font-sans text-[#231F1E] border-l-4 border-[#EF713F] shadow-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <ReplyIcon className="w-4 h-4 text-[#EF713F] shrink-0" />
                    <div className="truncate">
                      <span className="font-bold block text-[11px] text-[#EF713F]">
                        Replying to {replyingToMessage.senderName}
                      </span>
                      <span className="truncate block text-[11px] text-[#6B6560]">
                        {replyingToMessage.content}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReplyingToMessage(null)}
                    className="text-gray-400 hover:text-red-500 border-0 bg-transparent cursor-pointer p-1 font-bold text-xs"
                    title="Cancel reply"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attachment Preview Draft Badge */}
            {selectedAttachment && (
              <div className="flex items-center justify-between bg-[#FBF9F5] p-2.5 rounded-2xl text-xs font-mono text-[#231F1E] border border-gray-200/80">
                <div className="flex items-center space-x-2 truncate">
                  {selectedAttachment.type === 'EXPENSE' ? (
                    <Wallet3 size={16} variant="Bold" className="text-[#EF713F]" />
                  ) : (
                    <TaskSquare size={16} variant="Bold" className="text-[#8964B3]" />
                  )}
                  <span className="font-semibold truncate">Attached: {selectedAttachment.title}</span>
                  {selectedAttachment.amount && (
                    <span className="text-[#EF713F] font-bold">₦{selectedAttachment.amount.toLocaleString()}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="text-gray-400 hover:text-red-500 border-0 bg-transparent cursor-pointer p-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Popup Real Attachment Picker Menu */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="p-3 rounded-3xl bg-[#FBF9F5] space-y-3 border border-gray-200/60 shadow-xl max-h-60 overflow-y-auto"
                >
                  {/* Category Filter Tabs */}
                  <div className="flex items-center space-x-2 border-b border-gray-200/60 pb-2">
                    <button
                      type="button"
                      onClick={() => setAttachTab('EXPENSE')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                        attachTab === 'EXPENSE' ? 'bg-[#EF713F] text-white' : 'bg-white text-[#6B6560]'
                      }`}
                    >
                      💳 Expenses ({transactions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachTab('TASK')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                        attachTab === 'TASK' ? 'bg-[#8964B3] text-white' : 'bg-white text-[#6B6560]'
                      }`}
                    >
                      📝 Tasks ({tasks.length})
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    {attachTab === 'EXPENSE' ? (
                      transactions.length === 0 ? (
                        <p className="text-xs text-[#6B6560] p-2 text-center">No logged expenses found</p>
                      ) : (
                        transactions.map(tx => (
                          <button
                            key={tx.id}
                            type="button"
                            onClick={() => {
                              setSelectedAttachment({
                                type: 'EXPENSE',
                                title: tx.title,
                                amount: tx.amount,
                                id: tx.id
                              });
                              setShowAttachMenu(false);
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-semibold text-[#231F1E] transition-colors border-0 cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <Wallet3 size={16} variant="Bold" className="text-[#EF713F]" />
                              <span className="truncate">{tx.title}</span>
                            </div>
                            <span className="font-extrabold text-[#EF713F] shrink-0 font-mono ml-2">
                              ₦{tx.amount.toLocaleString()}
                            </span>
                          </button>
                        ))
                      )
                    ) : (
                      tasks.length === 0 ? (
                        <p className="text-xs text-[#6B6560] p-2 text-center">No tasks found</p>
                      ) : (
                        tasks.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedAttachment({
                                type: 'TASK',
                                title: t.title,
                                id: t.id
                              });
                              setShowAttachMenu(false);
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-semibold text-[#231F1E] transition-colors border-0 cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <TaskSquare size={16} variant="Bold" className="text-[#8964B3]" />
                              <span className="truncate">{t.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#6B6560] shrink-0 ml-2">
                              {t.category}
                            </span>
                          </button>
                        ))
                      )
                    )}
                  </div>
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
                title="Tag Expense or Task"
              >
                <Add size={20} variant="Linear" className={showAttachMenu ? 'rotate-45 text-[#EF713F]' : ''} />
              </button>

              {/* Text Input */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={selectedAttachment ? `Add a note to ${selectedAttachment.title}...` : `Message ${partnerUser.name}...`}
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
                disabled={!inputText.trim() && !selectedAttachment}
                className={`p-3 rounded-2xl transition-all border-0 cursor-pointer shrink-0 flex items-center justify-center ${
                  inputText.trim() || selectedAttachment
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
