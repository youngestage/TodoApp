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
  Notification
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
    setCurrentView
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
      
      {/* 1. Simplified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560]">
            Manage profile photo, push notifications, currencies, categories & accounts
          </p>
        </div>
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

            {/* Household Partner Invite Link */}
            <div className="bg-white rounded-3xl p-6 space-y-4 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-lg text-[#231F1E]">Partner Invite Code</h3>
                <p className="text-xs text-[#6B6560]">Share with your partner to sync your household workspace</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 px-4 py-2.5 bg-[#FBF9F5] rounded-2xl font-mono text-sm font-bold text-[#231F1E] text-center border-0 tracking-wider">
                  {household.inviteCode}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-3 rounded-2xl bg-[#231F1E] text-white hover:bg-black transition-colors cursor-pointer border-0 flex items-center justify-center"
                  title="Copy Invite Code"
                >
                  {copied ? <TickCircle size={18} variant="Bold" className="text-[#4A7C59]" /> : <Copy size={18} variant="Linear" />}
                </button>
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
                <h3 className="font-bold text-lg text-[#231F1E]">Global Preferences</h3>
                <p className="text-xs text-[#6B6560]">Set your base currency symbol, fiscal year, and calendar start day</p>
              </div>

              {/* Currency Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Base Currency Symbol
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { symbol: '₦', label: 'Nigerian Naira (₦)' },
                    { symbol: '$', label: 'US Dollar ($)' },
                    { symbol: '€', label: 'Euro (€)' },
                    { symbol: '£', label: 'British Pound (£)' }
                  ].map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => updatePreferences({ currency: item.symbol })}
                      className={`p-3 rounded-2xl text-xs font-semibold transition-all border-0 cursor-pointer flex items-center justify-between ${
                        preferences.currency === item.symbol
                          ? 'bg-[#EF713F] text-white font-bold'
                          : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#F5F3EF]'
                      }`}
                    >
                      <span className="font-mono text-base">{item.symbol}</span>
                      <span>{item.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fiscal Year */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Active Fiscal Budget Year
                </label>
                <div className="flex items-center space-x-2">
                  {[2025, 2026, 2027].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => updatePreferences({ budgetYear: yr })}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all border-0 cursor-pointer ${
                        preferences.budgetYear === yr
                          ? 'bg-[#231F1E] text-white'
                          : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                      }`}
                    >
                      FY {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar Start Day */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Week Starts On
                </label>
                <div className="flex items-center space-x-2">
                  {(['Monday', 'Sunday'] as const).map((day) => (
                    <button
                      key={day}
                      onClick={() => updatePreferences({ firstDayOfWeek: day })}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                        preferences.firstDayOfWeek === day
                          ? 'bg-[#4A7C59] text-white font-bold'
                          : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 3: CATEGORY MANAGER */}
        {activeSection === 'categories' && (
          <motion.div
            key="categories-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Categories & Subcategories</h3>
                <p className="text-xs text-[#6B6560]">Customize subcategories under the 6 main parent categories</p>
              </div>

              {/* Primary Category Selector */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {(['Income', 'Expenses', 'Bills', 'Savings', 'Investments', 'Debt'] as BudgetCategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedParentCategory(cat);
                      setSubcategoryError(null);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                      selectedParentCategory === cat
                        ? 'bg-[#EF713F] text-white font-bold'
                        : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Add New Subcategory Form */}
              <form onSubmit={handleAddSubcategorySubmit} className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Add Subcategory to {selectedParentCategory}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder={`E.g. Organic Produce, Subscriptions, Anniversary Pot...`}
                    className="flex-1 px-4 py-2.5 bg-[#FBF9F5] rounded-2xl text-xs text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#231F1E] hover:bg-black text-white text-xs font-bold rounded-2xl border-0 cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    <Add size={16} variant="Linear" />
                    <span>Add</span>
                  </button>
                </div>

                {subcategoryError && (
                  <p className="text-xs text-[#EF713F] font-mono font-semibold pt-1">
                    ⚠️ {subcategoryError}
                  </p>
                )}
              </form>

              {/* Subcategories List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono font-semibold text-[#6B6560] uppercase tracking-wider block">
                  Active Subcategories ({(subcategories[selectedParentCategory] || []).length}/20)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(subcategories[selectedParentCategory] || []).map((sub) => (
                    <div
                      key={sub}
                      className="p-3 rounded-2xl bg-[#FBF9F5] flex items-center justify-between text-xs font-semibold text-[#231F1E] border-0"
                    >
                      <span>{sub}</span>
                      <button
                        onClick={() => deleteSubcategory(selectedParentCategory, sub)}
                        className="p-1 text-[#6B6560] hover:text-[#EF713F] border-0 bg-transparent cursor-pointer"
                        title="Delete Subcategory"
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

        {/* SECTION 4: PAYMENT ACCOUNTS */}
        {activeSection === 'accounts' && (
          <motion.div
            key="accounts-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Payment Accounts Setup</h3>
                <p className="text-xs text-[#6B6560]">Configure up to 10 customizable payment accounts for transaction tagging</p>
              </div>

              <form onSubmit={handleAddAccountSubmit} className="space-y-2">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Add Payment Account Slot
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="E.g. Moniepoint, Kuda (Asa), GTBank (Leslie)..."
                    className="flex-1 px-4 py-2.5 bg-[#FBF9F5] rounded-2xl text-xs text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#231F1E] hover:bg-black text-white text-xs font-bold rounded-2xl border-0 cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    <Add size={16} variant="Linear" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {accountError && (
                  <p className="text-xs text-[#EF713F] font-mono font-semibold pt-1">
                    ⚠️ {accountError}
                  </p>
                )}
              </form>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-mono font-semibold text-[#6B6560] uppercase tracking-wider block">
                  Configured Accounts ({paymentAccounts.length}/10 Max)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentAccounts.map((acc, i) => (
                    <div
                      key={acc}
                      className="p-4 rounded-2xl bg-[#FBF9F5] flex items-center justify-between border-0"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white text-[#EF713F] font-mono text-xs font-bold flex items-center justify-center">
                          0{i + 1}
                        </div>
                        <span className="text-xs font-bold text-[#231F1E]">{acc}</span>
                      </div>

                      <button
                        onClick={() => deletePaymentAccount(acc)}
                        className="p-1 text-[#6B6560] hover:text-[#EF713F] border-0 bg-transparent cursor-pointer"
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
              <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
                <h3 className="font-bold text-lg text-[#231F1E]">Debt Strategy & Extra Monthly Allocation</h3>
                <p className="text-xs text-[#6B6560]">Choose Snowball, Avalanche, or Minimum payment strategy</p>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Repayment Engine Strategy
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Snowball', label: 'Debt Snowball', desc: 'Pay lowest balance first for quick psychological wins' },
                    { id: 'Avalanche', label: 'Debt Avalanche', desc: 'Pay highest interest rate first to minimize interest' },
                    { id: 'Minimum', label: 'Minimum Only', desc: 'Stick strictly to required minimum monthly payments' }
                  ].map((strat) => (
                    <button
                      key={strat.id}
                      onClick={() => updateDebtConfig(strat.id as any, extraDebtContribution)}
                      className={`p-4 rounded-2xl text-left border-0 transition-all cursor-pointer space-y-1 ${
                        debtStrategy === strat.id
                          ? 'bg-[#231F1E] text-white shadow-none'
                          : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#F5F3EF]'
                      }`}
                    >
                      <h4 className="font-bold text-xs">{strat.label}</h4>
                      <p className={`text-[11px] leading-tight ${debtStrategy === strat.id ? 'text-white/70' : 'text-[#6B6560]'}`}>
                        {strat.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Lump Sum */}
              <div className="p-4 rounded-2xl bg-[#FFF5F0] space-y-2 border-0">
                <label className="block text-xs font-bold text-[#231F1E]">
                  Extra Monthly Payment Allocation ({preferences.currency})
                </label>
                <input
                  type="number"
                  value={extraDebtContribution}
                  onChange={(e) => updateDebtConfig(debtStrategy, parseFloat(e.target.value) || 0)}
                  placeholder="30000"
                  className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-mono font-bold text-[#231F1E] border-0 focus:outline-none"
                />
              </div>

              {/* Debt Accounts */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-mono font-semibold text-[#6B6560] uppercase tracking-wider block">
                  Active Debt Accounts ({debtAccounts.length})
                </span>

                <div className="space-y-2.5">
                  {debtAccounts.map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-[#FBF9F5] border-0 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#231F1E]">{d.name}</h4>
                        <p className="text-[#6B6560] font-mono text-[11px]">
                          Rate: {d.interestRate}% • Min Pay: {preferences.currency}{d.minimumPayment.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-extrabold text-[#EF713F] text-sm block">
                          {preferences.currency}{d.balance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#6B6560]">Due: {d.dueDate}</span>
                      </div>
                    </div>
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
