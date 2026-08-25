import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Copy, TickCircle, Heart, People, ArrowLeft, ArrowRight } from 'iconsax-react';

export const InviteView: React.FC = () => {
  const { household, setCurrentView, currentUser, partnerUser, ensureUserHousehold, joinHouseholdWithKey, leaveHousehold } = useStore();
  const [copied, setCopied] = useState(false);

  const [inputCode, setInputCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const displayCode = household.inviteCode || localStorage.getItem('coupletodo_permanent_invite_code') || 'X7K2P9';
  const isPartnerConnected = (household.members?.length || 0) >= 2 || (partnerUser && partnerUser.id !== 'usr_partner_waiting');

  useEffect(() => {
    if ((household.id === 'hh_initial' || !household.id) && currentUser?.id && !currentUser.id.startsWith('usr_')) {
      ensureUserHousehold(currentUser.id, currentUser.name);
    }
  }, [household.id, currentUser]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinPartnerSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode || inputCode.trim().length < 4) {
      setJoinError('Please enter a valid 6-digit partner key.');
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    setJoinSuccess(false);

    try {
      await joinHouseholdWithKey(inputCode);
      setJoinSuccess(true);
      setInputCode('');
      setTimeout(() => setJoinSuccess(false), 4000);
    } catch (err: any) {
      setJoinError(err.message || 'Error joining partner space.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveHousehold();
      setLeaveModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error leaving household space.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="relative z-10 w-full max-w-lg space-y-6">
        
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs text-[#6B6560] hover:text-[#231F1E] font-medium transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} variant="Linear" />
          <span>Back to Dashboard</span>
        </button>

        <Card className="p-6 sm:p-8 space-y-6 text-center border-0 shadow-none relative overflow-hidden bg-white">
          <div className="space-y-3">
            <img src="/partner_invite.svg" alt="Partner Pairing Invite" className="w-24 sm:w-28 h-24 sm:h-28 mx-auto object-contain drop-shadow-xs" />

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E]">
              {household.name || 'My Household'}
            </h2>
            <p className="text-xs text-[#6B6560]">
              Share your code with a partner or enter your partner's 6-digit key to sync workspaces.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5F3EF] border-0 text-xs font-mono text-[#6B6560]">
            <People size={14} variant="Bold" className="text-[#8964B3]" />
            <span>
              {isPartnerConnected ? '2/2 Partners Connected 🎉' : `Max household capacity: ${household.maxMembers || 2} partners`}
            </span>
          </div>

          {/* Section 1: My Household Pairing Code */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-medium text-[#6B6560] uppercase tracking-wider font-mono">
              Your Household Pairing Code
            </label>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FBF9F5] border-0">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-[#231F1E] pl-2">
                {displayCode}
              </span>

              <button
                onClick={handleCopyCode}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 border-0 transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#4A7C59] text-white'
                    : 'bg-[#EF713F] hover:bg-[#D95220] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <TickCircle size={16} variant="Bold" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} variant="Linear" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Enter Partner's Key to Join (Shown only if not paired) */}
          {!isPartnerConnected && (
            <div className="p-5 rounded-3xl bg-[#FBF9F5] border-0 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase text-[#8964B3]">
                  Have a Partner's Key? Join Their Space
                </label>
              </div>

              {joinError && (
                <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                  ⚠️ {joinError}
                </div>
              )}

              {joinSuccess && (
                <div className="p-3 rounded-2xl bg-[#EBF3ED] text-xs text-[#4A7C59] font-mono font-semibold">
                  🎉 Successfully joined partner space! Synchronizing...
                </div>
              )}

              <form onSubmit={handleJoinPartnerSpace} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit key (e.g. X7K2P9)"
                  className="w-full sm:flex-1 px-4 py-3 bg-white rounded-2xl font-mono font-extrabold text-center sm:text-left text-sm text-[#8964B3] tracking-wider border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
                />

                <button
                  type="submit"
                  disabled={isJoining || !inputCode.trim()}
                  className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#8964B3] hover:bg-[#7853A2] disabled:opacity-50 text-white font-bold text-xs transition-all border-0 cursor-pointer shrink-0 shadow-xs flex items-center justify-center space-x-1"
                >
                  {isJoining ? (
                    <span>Pairing...</span>
                  ) : (
                    <>
                      <span>Join Partner Space</span>
                      <ArrowRight size={16} variant="Linear" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Connected Status Card */}
          {isPartnerConnected ? (
            <div className="p-4 rounded-2xl bg-[#EBF3ED] border-0 space-y-3">
              <div className="flex items-center justify-center space-x-4">
                <div className="relative">
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} isOnline size="md" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4A7C59] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <Heart size={18} variant="Bold" className="text-[#EF713F] animate-pulse" />
                </div>

                <div className="relative">
                  <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} isOnline size="md" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4A7C59] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                </div>
              </div>

              <p className="text-xs text-[#4A7C59] font-bold">
                🎉 {partnerUser.name} is connected to your workspace!
              </p>

              <button
                type="button"
                onClick={() => setLeaveModalOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#FFF5F0] hover:bg-[#FFEAE0] text-[#EF713F] text-xs font-bold transition-colors border-0 cursor-pointer"
              >
                Unpair & Leave Household Space
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F6F3FA] border-0 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} isOnline size="md" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4A7C59] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                </div>

                <div className="flex items-center space-x-1 text-[#8964B3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping delay-300" />
                </div>

                <div className="w-9 h-9 rounded-full border-0 flex items-center justify-center bg-white text-[#8964B3]">
                  <People size={16} variant="Linear" className="opacity-60" />
                </div>
              </div>

              <p className="text-xs text-[#8964B3] font-medium animate-pulse">
                Waiting for your partner to join...
              </p>
            </div>
          )}

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#231F1E] hover:bg-black text-white text-sm font-bold flex items-center justify-center space-x-2 border-0 transition-all cursor-pointer shadow-md"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight size={16} variant="Linear" />
          </button>
        </Card>
      </div>

      {/* LEAVE HOUSEHOLD CONFIRMATION MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer" onClick={() => setLeaveModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border-0 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center mx-auto">
              <Heart size={24} variant="Bold" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-xl text-[#231F1E]">Leave Household Space?</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Are you sure you want to unpair and leave this household? You will no longer share tasks, budget, or chat with your partner until paired again.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] font-bold text-xs border-0 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLeaving}
                onClick={handleConfirmLeave}
                className="flex-1 py-3 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] disabled:opacity-50 text-white font-bold text-xs transition-colors border-0 cursor-pointer flex items-center justify-center space-x-1"
              >
                {isLeaving ? <span>Unpairing...</span> : <span>Confirm Unpair</span>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
