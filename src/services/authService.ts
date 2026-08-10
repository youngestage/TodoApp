import { supabase } from '../lib/supabase';

export async function ensureAuthSession(email: string, password: string, name: string) {
  // Try sign in first
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInData?.user) {
    return { user: signInData.user, session: signInData.session };
  }

  // If sign in fails, attempt sign up
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (signUpErr) {
    throw new Error(signUpErr.message || signInErr?.message || 'Authentication failed');
  }

  // Handle case where email exists but signIn failed with wrong password
  if (signUpData.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
    throw new Error('An account with this email already exists. Please enter your correct password to sign in.');
  }

  if (signUpData.user) {
    return { user: signUpData.user, session: signUpData.session };
  }

  throw new Error('Authentication failed. Please check your credentials.');
}

export async function deleteUserAccount(userId: string) {
  try {
    await supabase.rpc('delete_user_account');
  } catch (e) {
    console.warn('RPC delete_user_account skipped or unavailable:', e);
  }

  if (userId) {
    await supabase.from('profiles').delete().eq('id', userId);
  }

  await supabase.auth.signOut();
}
