import { User } from '../types';

export function getUserAvatarUrl(
  name: string,
  currentUser?: User | null,
  partnerUser?: User | null
): string {
  if (!name) return 'https://api.dicebear.com/7.x/micah/svg?seed=User';

  const normalized = name.trim().toLowerCase();
  const currentName = (currentUser?.name || '').trim().toLowerCase();
  const partnerName = (partnerUser?.name || '').trim().toLowerCase();

  // Joint / Both / Household / Shared
  if (
    normalized === 'joint' ||
    normalized === 'shared' ||
    normalized === 'both' ||
    normalized === 'household' ||
    normalized === 'joint household'
  ) {
    return 'https://api.dicebear.com/7.x/personas/svg?seed=JointHousehold&backgroundColor=E9C277';
  }

  // Current User
  if (currentName && normalized === currentName) {
    if (currentUser?.avatarUrl && !currentUser.avatarUrl.includes('initials/svg')) {
      return currentUser.avatarUrl;
    }
    return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(currentUser?.name || name)}&backgroundColor=EF713F`;
  }

  // Partner User
  if (partnerName && normalized === partnerName) {
    if (partnerUser?.avatarUrl && !partnerUser.avatarUrl.includes('initials/svg')) {
      return partnerUser.avatarUrl;
    }
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(partnerUser?.name || name)}&backgroundColor=BEABD8`;
  }

  // Fallback to micah persona avatar (never initials!)
  return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}&backgroundColor=4A7C59`;
}
