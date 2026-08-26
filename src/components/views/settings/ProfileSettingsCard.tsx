import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { Avatar } from '../../ui/Avatar';
import { sendPushNotification, getNotificationPermissionState, requestNotificationPermission, subscribeUserToWebPush } from '../../../utils/notifications';
import { Camera, Mobile, TickCircle, Copy, Danger } from 'iconsax-react';

interface ProfileSettingsCardProps {
  onOpenDeleteModal: () => void;
}

export const ProfileSettingsCard: React.FC<ProfileSettingsCardProps> = ({ onOpenDeleteModal }) => {
  const { currentUser, household, updateUserAvatar, updateUserName } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  const [nameInput, setNameInput] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  useEffect(() => {
    setNameInput(currentUser.name);
  }, [currentUser.name]);

  useEffect(() => {
    setPermissionState(getNotificationPermissionState());
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    await updateUserName(nameInput);
    setIsSavingName(false);
    setNameSavedSuccess(true);
    setTimeout(() => setNameSavedSuccess(false), 2500);
  };

  const presetAvatars = [
    'https://api.dicebear.com/7.x/micah/svg?seed=Leslie&backgroundColor=EF713F',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=LeslieLove&backgroundColor=E9C277',
    'https://api.dicebear.com/7.x/thumbs/svg?seed=AsaPartner&backgroundColor=BEABD8',
    'https://api.dicebear.com/7.x/personas/svg?seed=CoupleJoy&backgroundColor=4A7C59',
    'https://api.dicebear.com/7.x/big-smile/svg?seed=LeslieStudio&backgroundColor=EF713F',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=CoupleMagic&backgroundColor=E9C277'
  ];

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
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleNotifications = async () => {
    if (permissionState !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionState(getNotificationPermissionState());
      if (granted && currentUser?.id && household?.id) {
        await subscribeUserToWebPush(currentUser.id, household.id);
        sendPushNotification('Notifications Enabled 🎉', 'You will now receive live alerts when your partner updates tasks, expenses, or chat!');
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Household Partner Invite Link */}
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

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <h4 className="font-bold text-base text-[#231F1E]">{currentUser.name} (You)</h4>
              <p className="text-xs text-[#6B6560] font-mono">Partner • {household.name}</p>
            </div>

            <form onSubmit={handleSaveName} className="flex items-center space-x-2 max-w-xs">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Display Name"
                className="px-3.5 py-2 bg-[#FBF9F5] rounded-xl text-xs font-bold text-[#231F1E] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30 flex-1"
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="px-3.5 py-2 rounded-xl bg-[#231F1E] hover:bg-black text-white font-bold text-xs border-0 cursor-pointer transition-colors shrink-0"
              >
                {nameSavedSuccess ? 'Saved! ✓' : isSavingName ? 'Saving...' : 'Save Name'}
              </button>
            </form>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs border-0 cursor-pointer transition-colors"
            >
              Upload Custom Photo
            </button>

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
        </div>
      </div>

      {/* DANGER ZONE: DELETE ACCOUNT CARD */}
      <div className="bg-white rounded-3xl p-6 space-y-4 border-2 border-[#FFF5F0] shadow-none">
        <div className="flex items-center justify-between border-b border-[#FFF5F0] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#FFF5F0] text-[#EF713F]">
              <Danger size={20} variant="Bold" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#EF713F]">Danger Zone</h3>
              <p className="text-xs text-[#6B6560]">Permanently delete your profile and household data</p>
            </div>
          </div>

          <button
            onClick={onOpenDeleteModal}
            className="px-4 py-2 rounded-2xl bg-[#FFF5F0] hover:bg-[#EF713F] text-[#EF713F] hover:text-white font-bold text-xs transition-colors border-0 cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
