import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Add, Trash } from 'iconsax-react';

export const PaymentAccountsManager: React.FC = () => {
  const { paymentAccounts, addPaymentAccount, deletePaymentAccount } = useStore();
  const [newAccountName, setNewAccountName] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    const success = addPaymentAccount(newAccountName);
    if (!success) {
      setAccountError('Account already exists or maximum of 10 accounts reached.');
    } else {
      setNewAccountName('');
      setAccountError(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
      <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
        <h3 className="font-bold text-lg text-[#231F1E]">Payment Accounts Manager</h3>
        <p className="text-xs text-[#6B6560]">Configure up to 10 payment accounts for fast transaction logging</p>
      </div>

      <form onSubmit={handleAddAccountSubmit} className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="E.g. Moniepoint (Joint)..."
            className="flex-1 px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#231F1E] text-white hover:bg-black font-bold text-xs border-0 cursor-pointer transition-colors flex items-center space-x-1"
          >
            <Add size={16} />
            <span>Add</span>
          </button>
        </div>

        {accountError && (
          <p className="text-xs text-[#EF713F] font-mono font-semibold">
            ⚠️ {accountError}
          </p>
        )}
      </form>

      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
          Configured Accounts ({paymentAccounts.length}/10)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentAccounts.map((acc) => (
            <div
              key={acc}
              className="p-3.5 rounded-2xl bg-[#FBF9F5] flex items-center justify-between border-0"
            >
              <span className="font-bold text-xs text-[#231F1E]">{acc}</span>
              <button
                onClick={() => deletePaymentAccount(acc)}
                className="p-1 rounded-xl text-[#6B6560] hover:text-[#EF713F] border-0 bg-transparent cursor-pointer"
                title="Remove Account"
              >
                <Trash size={16} variant="Linear" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
