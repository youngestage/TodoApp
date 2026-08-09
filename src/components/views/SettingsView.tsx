import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { BudgetCategoryType } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  requestNotificationPermission,
  getNotificationPermissionState,
  sendPushNotification
} from '../../utils/notifications';
import {
  Setting2,
  Global,
  Category,
  Wallet3,
  Flash,
  MagicStar,
  Mobile,
  Add,
  Trash,
  Copy,
  TickCircle,
  UserAdd,
  Heart,
  Card,
  Camera,
  Notification,
  LogoutCurve
} from 'iconsax-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    updateUserAvatar,
    preferences,
    updatePreferences,
    subcategories,
    addSubcategory,
    deleteSubcategory,
    paymentAccounts,
    addPaymentAccount,
    deletePaymentAccount,
    debtAccounts,
    debtStrategy,
    extraDebtContribution,
    updateDebtConfig,
    addDebtAccount,
    savingsGoals,
    addSavingsGoal,
    recurringBills,
    household,
    setCurrentView,
    logout
  } = useStore();

  const [activeSection, setActiveSection] = useState<'profile' | 'global' | 'categories' | 'accounts' | 'debt'>('profile');
  
  // Avatar upload local state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  // Preset DiceBear colorful avatar choices matching app theme
  const presetAvatars = [
    'https://api.dicebear.com/7.x/micah/svg?seed=Leslie&backgroundColor=EF713F',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=LeslieLove&backgroundColor=E9C277',
    'https://api.dicebear.com/7.x/thumbs/svg?seed=AsaPartner&backgroundColor=BEABD8',
    'https://api.dicebear.com/7.x/personas/svg?seed=CoupleJoy&backgroundColor=4A7C59',
    'https://api.dicebear.com/7.x/big-smile/svg?seed=LeslieStudio&backgroundColor=EF713F',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=CoupleMagic&backgroundColor=E9C277'
  ];

  // Notification permission state
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermissionState(getNotificationPermissionState());
  }, []);

  // Category management state
  const [selectedParentCategory, setSelectedParentCategory] = useState<BudgetCategoryType>('Expenses');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  // Accounts state
  const [newAccountName, setNewAccountName] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);

  // Copy code state
  const [copied, setCopied] = useState(false);

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError('Image size should be under 5MB');
      return;
    }

    setAvatarUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateUserAvatar(event.target.result as string);
        sendPushNotification('Profile Photo Updated', 'Your household profile photo has been refreshed!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle Notification Permission
  const handleToggleNotifications = async () => {
    if (permissionState !== 'granted') {
      const granted = await requestNotificationPermission();
      const updatedState = getNotificationPermissionState();
      setPermissionState(updatedState);

      if (granted) {
        sendPushNotification('Notifications Enabled', 'You will now receive alerts for tasks, expenses, and chat!');
      }
    }
  };

  const handleAddSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    const success = addSubcategory(selectedParentCategory, newSubcategoryName);
    if (!success) {
      setSubcategoryError(`"${newSubcategoryName}" already exists in ${selectedParentCategory}.`);
    } else {
      setNewSubcategoryName('');
      setSubcategoryError(null);
    }
  };

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto">
      
      {/* 1. Simplified Header with Log Out CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560]">
            Manage profile photo, push notifications, invite code & accounts
          </p>
        </div>

        {/* Prominent Red Log Out Button */}
        <button
          onClick={async () => {
            await logout();
          }}
          className="px-4 py-2.5 rounded-2xl bg-[#FFF5F0] hover:bg-[#FFEAE0] text-[#EF713F] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border-0 shrink-0"
        >
          <LogoutCurve size={18} variant="Bold" />
          <span>Log Out</span>
        </button>
      </div>

      {/* 2. Simplified Section Switcher */}
      <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Notifications', icon: Notification },
          { id: 'global', label: 'Global Preferences', icon: Global },
          { id: 'categories', label: 'Category Tree', icon: Category },
          { id: 'accounts', label: 'Payment Accounts', icon: Wallet3 },
          { id: 'debt', label: 'Debt & Savings', icon: Flash }
        ].map((sec) => {
          const IconComp = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                isActive
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
              }`}
            >
              <IconComp size={16} variant={isActive ? "Bold" : "Linear"} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content */}
      <AnimatePresence mode="wait">
        
        {/* SECTION 1: PROFILE & PUSH NOTIFICATIONS */}
        {activeSection === 'profile' && (
          <motion.div
            key="profile-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Household Partner Invite Link (Always Available for Existing Users) */}
            <div className="bg-white rounded-3xl p-6 space-y-4 border-0 shadow-none">
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#231F1E]">Household Partner Invite Code</h3>
                  <p className="text-xs text-[#6B6560]">Always accessible code for your partner to join your space</p>
                </div>
                <img src="/partner_invite.svg" alt="Invite Code" className="w-12 h-12 object-contain hidden sm:block" />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 px-4 py-3 bg-[#F6F3FA] rounded-2xl font-mono text-lg font-extrabold text-[#8964B3] tracking-widest text-center border-0">
                  {household.inviteCode || 'LESLIE-ASA-2026'}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-5 py-3 rounded-2xl bg-[#8964B3] text-white hover:bg-[#7852A4] transition-colors cursor-pointer border-0 flex items-center space-x-1.5 font-bold text-xs shrink-0"
                  title="Copy Invite Code"
                >
                  {copied ? (
                    <>
                      <TickCircle size={18} variant="Bold" className="text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} variant="Linear" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Photo Upload Card */}
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Profile Photo & Avatar</h3>
                <p className="text-xs text-[#6B6560]">Upload your custom photo or pick a curated couple avatar</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                
                {/* Main Interactive Avatar with Camera Upload Icon */}
                <div className="relative group">
                  <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="lg" className="w-24 h-24 text-2xl ring-4 ring-[#FAF6EB]" />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#EF713F] text-white shadow-md hover:bg-[#D95220] transition-transform hover:scale-105 border-2 border-white cursor-pointer"
                    title="Upload Custom Photo"
                  >
                    <Camera size={16} variant="Bold" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-base text-[#231F1E]">{currentUser.name} (You)</h4>
                    <p className="text-xs text-[#6B6560] font-mono">Partner A • {household.name}</p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs border-0 cursor-pointer transition-colors"
                    >
                      Upload Custom Photo
                    </button>
                  </div>

                  {avatarUploadError && (
                    <p className="text-xs text-[#EF713F] font-mono font-semibold pt-1">
                      ⚠️ {avatarUploadError}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Preset Avatars Picker */}
              <div className="space-y-2 pt-2 border-t border-[#F5F3EF]">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Or Pick a Preset Avatar
                </label>
                <div className="flex items-center space-x-3">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateUserAvatar(url)}
                      className={`relative rounded-full p-0.5 transition-transform hover:scale-105 border-0 cursor-pointer ${
                        currentUser.avatarUrl === url ? 'ring-2 ring-[#EF713F]' : ''
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-10 h-10 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Push Notifications Card */}
            <div className="bg-white rounded-3xl p-6 space-y-5 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Browser Push Notifications</h3>
                <p className="text-xs text-[#6B6560]">Allow push alerts for joint task checks, logged expenses, and chat messages</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F5] border-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-white text-[#EF713F] flex items-center justify-center shadow-xs">
                      <Mobile size={20} variant="Bold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#231F1E]">Allow Household Notifications</h4>
                      <p className="text-xs text-[#6B6560]">Real-time PWA alerts on your device</p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleNotifications}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 border-0 cursor-pointer ${
                      permissionState === 'granted' ? 'bg-[#4A7C59]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        permissionState === 'granted' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="text-xs font-mono text-[#6B6560] border-t border-[#F5F3EF] pt-2 flex items-center justify-between">
                  <span>Current Permission Status:</span>
                  <span className={`font-bold ${permissionState === 'granted' ? 'text-[#4A7C59]' : 'text-[#CF9130]'}`}>
                    {permissionState.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 2: GLOBAL PREFERENCES */}
        {activeSection === 'global' && (
          <motion.div
            key="global-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Currency & Localization</h3>
                <p className="text-xs text-[#6B6560]">Configure base currency symbol for split calculation</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider mb-2">
                    Household Base Currency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['₦', '$', '£', '€'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => updatePreferences({ currency: sym })}
                        className={`p-3.5 rounded-2xl font-mono text-lg font-bold border-0 cursor-pointer transition-all ${
                          preferences.currency === sym
                            ? 'bg-[#231F1E] text-white shadow-md'
                            : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#FAF6EB]'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider mb-2">
                    First Day of the Week
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Sunday', 'Monday'].map((day) => (
                      <button
                        key={day}
                        onClick={() => updatePreferences({ firstDayOfWeek: day as any })}
                        className={`p-3 rounded-2xl font-semibold text-xs border-0 cursor-pointer transition-all ${
                          preferences.firstDayOfWeek === day
                            ? 'bg-[#231F1E] text-white'
                            : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#FAF6EB]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 3: CATEGORY TREE */}
        {activeSection === 'categories' && (
          <motion.div
            key="cat-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Budget Category Manager</h3>
                <p className="text-xs text-[#6B6560]">Manage up to 20 subcategories per master group</p>
              </div>

              {/* Master Group Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {(['Income', 'Expenses', 'Bills', 'Savings', 'Investments', 'Debt'] as BudgetCategoryType[]).map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedParentCategory(group);
                      setSubcategoryError(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                      selectedParentCategory === group
                        ? 'bg-[#EF713F] text-white'
                        : 'bg-[#FBF9F5] text-[#6B6560] hover:text-[#231F1E]'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Add New Subcategory Form */}
              <form onSubmit={handleAddSubcategorySubmit} className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder={`New subcategory under ${selectedParentCategory}...`}
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

                {subcategoryError && (
                  <p className="text-xs text-[#EF713F] font-mono font-semibold">
                    ⚠️ {subcategoryError}
                  </p>
                )}
              </form>

              {/* Current Subcategories Chips */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Active Subcategories ({subcategories[selectedParentCategory]?.length || 0}/20)
                </label>

                <div className="flex flex-wrap gap-2">
                  {(subcategories[selectedParentCategory] || []).map((item) => (
                    <div
                      key={item}
                      className="px-3.5 py-2 rounded-2xl bg-[#FBF9F5] text-xs font-semibold text-[#231F1E] flex items-center space-x-2 border-0"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => deleteSubcategory(selectedParentCategory, item)}
                        className="text-[#6B6560] hover:text-[#EF713F] border-0 bg-transparent cursor-pointer p-0.5"
                        title="Remove"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 4: PAYMENT ACCOUNTS */}
        {activeSection === 'accounts' && (
          <motion.div
            key="acc-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
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
                    placeholder="E.g. Moniepoint (Leslie)..."
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
          </motion.div>
        )}

        {/* SECTION 5: DEBT & SAVINGS STRATEGY */}
        {activeSection === 'debt' && (
          <motion.div
            key="debt-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-[#231F1E]">Debt Strategy & Extra Monthly Allocation</h3>
                  <p className="text-xs text-[#6B6560]">Choose Snowball, Avalanche, or Minimum payment strategy</p>
                </div>
                <img src="/debt_freedom.svg" alt="Debt Freedom" className="w-16 h-16 object-contain shrink-0 hidden sm:block" />
              </div>

              {/* Strategy Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Repayment Engine Strategy
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Snowball', 'Avalanche', 'Minimum'] as const).map((strat) => (
                    <button
                      key={strat}
                      onClick={() => updateDebtConfig(strat, extraDebtContribution)}
                      className={`p-3 rounded-2xl text-xs font-bold border-0 cursor-pointer transition-all ${
                        debtStrategy === strat
                          ? 'bg-[#231F1E] text-white shadow-md'
                          : 'bg-[#FBF9F5] text-[#6B6560] hover:text-[#231F1E]'
                      }`}
                    >
                      {strat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
