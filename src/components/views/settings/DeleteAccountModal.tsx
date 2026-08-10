import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { deleteUserAccount } from '../../../services/authService';
import { Danger } from 'iconsax-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useStore();
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);

    try {
      await deleteUserAccount(currentUser?.id);
    } catch (err) {
      console.warn('Account deletion cleanup error:', err);
    } finally {
      localStorage.clear();
      setIsDeleting(false);
      onClose();
      await logout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 space-y-5 shadow-2xl border-0 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center mx-auto">
          <Danger size={24} variant="Bold" />
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-xl text-[#231F1E]">Delete Account Permanently?</h3>
          <p className="text-xs text-[#6B6560]">
            This will delete your profile data and log you out. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-2 pt-1 text-left">
          <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase">
            Type <span className="text-[#EF713F] font-bold">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm font-mono text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
          />
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] font-bold text-xs border-0 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
            onClick={handleDeleteAccountConfirm}
            className="flex-1 py-3 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] disabled:opacity-50 text-white font-bold text-xs transition-colors border-0 cursor-pointer flex items-center justify-center space-x-1"
          >
            {isDeleting ? <span>Deleting...</span> : <span>Confirm Delete</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
