import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, MessageText, Send2 } from 'iconsax-react';

export const ContextualThreadDrawer: React.FC = () => {
  const {
    activeContextualThread,
    closeContextualThread,
    contextualComments,
    addContextualComment,
    currentUser
  } = useStore();

  const [commentText, setCommentText] = useState('');

  const relevantComments = activeContextualThread
    ? contextualComments.filter(
        c => c.targetId === activeContextualThread.id &&
             c.targetType.toUpperCase() === activeContextualThread.type.toUpperCase()
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeContextualThread) return;

    addContextualComment(
      activeContextualThread.id,
      activeContextualThread.type,
      commentText
    );
    setCommentText('');
  };

  return (
    <AnimatePresence>
      {activeContextualThread && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => closeContextualThread()}
          />

          {/* Right Slide Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
            className="relative z-10 w-full max-w-md bg-white h-full border-0 shadow-2xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-0 pb-3">
                <div className="flex items-center space-x-2">
                  <MessageText size={22} variant="Bold" className="text-[#8964B3]" />
                  <div>
                    <h3 className="font-zodiak text-lg font-bold text-[#231F1E]">Inline Thread</h3>
                    <p className="text-xs text-[#6B6560] truncate max-w-[240px]">
                      {activeContextualThread.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => closeContextualThread()}
                  className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <CloseCircle size={22} variant="Broken" />
                </button>
              </div>

              {/* Thread Comments */}
              <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {relevantComments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B6560]">
                    No comments yet. Start the inline discussion below! ✨
                  </div>
                ) : (
                  relevantComments.map((comment) => {
                    const isMe = comment.authorName === currentUser.name;
                    return (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-2xl border-0 space-y-1 ${
                          isMe ? 'bg-[#F6F3FA] ml-4' : 'bg-[#FAF6EB] mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#231F1E]">{comment.authorName}</span>
                          <span className="text-[10px] font-mono text-[#6B6560]">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-[#231F1E] leading-relaxed">{comment.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add inline comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              />
              <button
                type="submit"
                className="p-3 bg-[#8964B3] hover:bg-[#7852A4] text-white rounded-xl border-0 transition-colors cursor-pointer shrink-0"
              >
                <Send2 size={16} variant="Bold" />
              </button>
            </form>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
