import { User } from '../types';

/**
 * Resolves which user is "slot A" and "slot B" using the DB role field.
 * partner_a = the primary member who created the household.
 * partner_b = the member who joined via invite code.
 *
 * This eliminates ALL alphabetical name-sorting logic which has no semantic meaning.
 */
export function resolvePartners(
  currentUser: User,
  partnerUser: User
): {
  userA: User;
  userB: User;
  iAmA: boolean;
  iAmB: boolean;
} {
  const iAmA = currentUser.role === 'partner_a';
  return {
    userA: iAmA ? currentUser : partnerUser,
    userB: iAmA ? partnerUser : currentUser,
    iAmA,
    iAmB: !iAmA,
  };
}

/**
 * Returns true if the given name matches the current user.
 */
export function isCurrentUser(name: string, currentUser: User): boolean {
  return currentUser.name === name;
}

/**
 * Resolves a "paidBy" name for bill/income auto-transactions.
 * If paidBy is a shared/joint sentinel, falls back to the current user's real name.
 */
export function resolvePaidByName(paidBy: string, currentUser: User): string {
  if (paidBy === 'Shared' || paidBy === 'Both' || paidBy === 'Joint') {
    return currentUser.name;
  }
  return paidBy;
}
