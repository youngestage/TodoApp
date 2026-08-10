import { supabase } from '../lib/supabase';
import { User, Household, Task, Transaction, ChatMessage, QuickNote } from '../types';

export function generateFreshInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getPermanentInviteCode(): string {
  let code = localStorage.getItem('coupletodo_permanent_invite_code');
  if (!code) {
    code = generateFreshInviteCode();
    localStorage.setItem('coupletodo_permanent_invite_code', code);
  }
  return code;
}

export async function fetchHouseholdDataFromDB(
  householdId: string,
  sessionUserId?: string
): Promise<{
  household: Household;
  currentUser?: User;
  partnerUser: User;
  tasks: Task[];
  transactions: Transaction[];
  chatMessages: ChatMessage[];
  quickNotes: QuickNote[];
} | null> {
  if (!householdId || householdId.startsWith('hh_')) return null;

  try {
    // 1. Fetch household record
    const { data: hh } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single();

    if (!hh) return null;

    // 2. Fetch profiles
    const { data: profs } = await supabase
      .from('profiles')
      .select('*')
      .eq('household_id', householdId);

    const members: User[] = (profs || []).map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${p.name}`,
      isOnline: true,
      role: p.role as any
    }));

    let foundCurrentUser: User | undefined;
    let partnerUser: User = {
      id: 'usr_partner_waiting',
      name: 'Waiting for Partner...',
      avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=WaitingPartner',
      isOnline: false,
      role: 'partner_b'
    };

    if (sessionUserId) {
      foundCurrentUser = members.find((m) => m.id === sessionUserId);
      const other = members.find((m) => m.id !== sessionUserId);
      if (other) partnerUser = other;
    } else if (members.length > 0) {
      foundCurrentUser = members[0];
      if (members.length > 1) partnerUser = members[1];
    }

    // 3. Fetch tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const tasks: Task[] = (tasksData || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      isJoint: t.is_joint ?? true,
      assignedTo: (t.assigned_to as any) || 'BOTH',
      assignedToName: t.assigned_to_name || 'Both',
      dueDate: t.due_date || 'Today',
      priority: t.priority || 'Medium',
      completed: t.completed ?? false,
      userACompleted: t.user_a_completed || false,
      userBCompleted: t.user_b_completed || false,
      commentsCount: t.comments_count || 0
    }));

    // 4. Fetch transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const transactions: Transaction[] = (txData || []).map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      paidBy: t.paid_by as any,
      account: t.account || 'Moniepoint Joint',
      isShared: t.is_shared,
      date: new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      commentsCount: 0
    }));

    // 5. Fetch chat messages
    const { data: msgsData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    const chatMessages: ChatMessage[] = (msgsData || []).map((m) => ({
      id: m.id,
      senderName: m.sender_name,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: m.attachment_type
        ? {
            type: m.attachment_type,
            title: m.attachment_title || '',
            amount: m.attachment_amount ? Number(m.attachment_amount) : undefined,
            id: m.attachment_ref_id || m.id
          }
        : undefined
    }));

    // 6. Fetch quick notes
    const { data: notesData } = await supabase
      .from('quick_notes')
      .select('*')
      .eq('household_id', householdId);

    const quickNotes: QuickNote[] = (notesData || []).map((n) => ({
      id: n.id,
      text: n.text,
      authorName: n.author_name,
      timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const household: Household = {
      id: hh.id,
      name: hh.name,
      inviteCode: hh.invite_code,
      maxMembers: hh.max_members || 2,
      members: members.length > 0 ? members : [foundCurrentUser || { id: 'usr_me', name: 'Partner A', avatarUrl: '', isOnline: true, role: 'partner_a' }],
      settleBalance: {
        debtor: partnerUser.name,
        creditor: foundCurrentUser?.name || 'Partner A',
        amount: 0,
        currency: '₦'
      }
    };

    return {
      household,
      currentUser: foundCurrentUser,
      partnerUser,
      tasks,
      transactions,
      chatMessages,
      quickNotes
    };
  } catch (err) {
    console.warn('Error fetching household data from Supabase DB:', err);
    return null;
  }
}

export async function ensureUserHouseholdInDB(userId: string, userName: string) {
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', userId)
      .maybeSingle();

    if (prof?.household_id) {
      return prof.household_id;
    }

    let freshCode = generateFreshInviteCode();
    let hh: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: newHh, error } = await supabase
        .from('households')
        .insert({
          name: `${userName}'s Household`,
          invite_code: freshCode,
          created_by: userId
        })
        .select()
        .single();

      if (newHh) {
        hh = newHh;
        break;
      }

      if (error && error.code === '23505') {
        freshCode = generateFreshInviteCode();
      } else {
        break;
      }
    }

    if (hh) {
      localStorage.setItem('coupletodo_permanent_invite_code', freshCode);
      await supabase.from('profiles').upsert({
        id: userId,
        name: userName,
        household_id: hh.id,
        role: 'partner_a'
      });
      return hh.id;
    }
  } catch (err) {
    console.warn('ensureUserHouseholdInDB error:', err);
  }
  return null;
}

export async function joinHouseholdWithKeyInDB(inviteCode: string, currentUserId: string, currentUserName: string) {
  const code = inviteCode.toUpperCase().trim();
  if (!code) throw new Error('Please enter a 6-digit key.');

  const { data: hhData } = await supabase
    .from('households')
    .select('*')
    .ilike('invite_code', code)
    .maybeSingle();

  if (!hhData) {
    throw new Error(`Household code "${code}" not found. Please verify the 6-character key shared by your partner.`);
  }

  const { error: profErr } = await supabase.from('profiles').upsert({
    id: currentUserId,
    name: currentUserName,
    household_id: hhData.id,
    role: 'partner_b'
  });

  if (profErr) throw new Error(profErr.message || 'Error linking profile to household.');

  return hhData.id;
}

export async function leaveHouseholdInDB(currentUserId: string, currentHouseholdId: string, currentUserName: string) {
  if (currentHouseholdId && !currentHouseholdId.startsWith('hh_')) {
    try {
      const channel = supabase.channel(`realtime_household_${currentHouseholdId}`);
      await channel.send({
        type: 'broadcast',
        event: 'partner_left',
        payload: { userId: currentUserId, userName: currentUserName }
      });
    } catch (e) {}
  }

  if (currentUserId && !currentUserId.startsWith('usr_')) {
    await supabase.from('profiles').update({
      household_id: null,
      role: 'partner_a'
    }).eq('id', currentUserId);
  }

  const newCode = generateFreshInviteCode();
  localStorage.setItem('coupletodo_permanent_invite_code', newCode);
  return newCode;
}
