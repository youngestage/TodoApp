import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, NoteText, Add } from 'iconsax-react';
import { Avatar } from '../ui/Avatar';

export const QuickNoteModal: React.FC = () => {
  const { isQuickNoteOpen, setQuickNoteOpen, quickNotes, addQuickNote } = useStore();
  const [noteText, setNoteText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addQuickNote(noteText);
    setNoteText('');
  };

  return (
    <AnimatePresence>
      {isQuickNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setQuickNoteOpen(false)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-0 pb-3">
              <div className="flex items-center space-x-2">
                <NoteText size={22} variant="Bold" className="text-[#EF713F]" />
                <h3 className="font-zodiak text-xl font-bold text-[#231F1E]">Household Quick Notes</h3>
              </div>
              <button
                onClick={() => setQuickNoteOpen(false)}
                className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <CloseCircle size={22} variant="Broken" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Jot down a quick household thought or note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#EF713F] hover:bg-[#D95220] text-white font-semibold rounded-xl text-xs sm:text-sm border-0 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Add size={16} variant="Bold" />
                <span>Save Quick Note</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pt-2">
              {quickNotes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-2xl bg-[#FAF6EB] border-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar name={note.authorName} size="sm" />
                      <span className="text-xs font-bold text-[#231F1E]">{note.authorName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6B6560]">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#231F1E] leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
