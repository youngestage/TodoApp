import { supabase } from '../lib/supabase';
import { User, Household, Task, Transaction, ChatMessage, QuickNote, RecurringBill, DebtAccount, DebtPayment, SavingsGoal, SavingsContribution, IncomeStream } from '../types';

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
  folders: any[];
  transactions: Transaction[];
  recurringBills: RecurringBill[];
  debtAccounts: DebtAccount[];
  savingsGoals: SavingsGoal[];
  incomeStreams: IncomeStream[];
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
      isOnline: p.is_online ?? false,
      lastSeen: p.last_seen_at || p.updated_at || undefined,
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
      commentsCount: t.comments_count || 0,
      subTasks: t.sub_tasks || [],
      tags: t.tags || [],
      folderId: t.folder_id,
      completedBy: t.completed_by
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

    // 7. Fetch task folders
    const { data: foldersData } = await supabase
      .from('task_folders')
      .select('*')
      .eq('household_id', householdId);

    const folders = (foldersData || []).map(f => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      color: f.color
    }));

    // 8. Fetch recurring bills
    const { data: billsData } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const recurringBills: RecurringBill[] = (billsData || []).map((b) => ({
      id: b.id,
      householdId: b.household_id,
      title: b.title,
      category: b.category,
      amount: Number(b.amount),
      currency: b.currency || '₦',
      icon: b.icon,
      notes: b.notes,
      frequency: b.frequency || 'monthly',
      customIntervalDays: b.custom_interval_days,
      nextDueDate: b.next_due_date,
      dueDate: b.next_due_date,
      paidBy: b.paid_by || 'Shared',
      splitType: b.split_type || 'equal',
      splitDetails: b.split_details,
      paymentMethod: b.payment_method || 'card',
      status: b.status || 'UPCOMING',
      autoLogTransaction: b.auto_log_transaction ?? true,
      reminderDaysBefore: b.reminder_days_before || 1,
      lastPaidDate: b.last_paid_date,
      createdAt: b.created_at
    }));

    // 9. Fetch debt accounts
    const { data: debtsData } = await supabase
      .from('debt_accounts')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const debtAccounts: DebtAccount[] = (debtsData || []).map((d) => ({
      id: d.id,
      householdId: d.household_id,
      name: d.name,
      category: d.category || 'bank_loan',
      lenderName: d.lender_name,
      principalAmount: Number(d.principal_amount),
      balance: Number(d.balance),
      rateType: d.rate_type || 'flat_monthly',
      interestRate: Number(d.interest_rate),
      effectiveAPR: Number(d.effective_apr),
      repaymentFrequency: d.repayment_frequency || 'monthly',
      loanTermMonths: d.loan_term_months,
      repaymentMethod: d.repayment_method || 'bank_transfer',
      minimumPayment: Number(d.minimum_payment),
      startDate: d.start_date,
      nextDueDate: d.next_due_date,
      dueDate: d.next_due_date,
      currency: d.currency || '₦',
      paidBy: d.paid_by || 'Shared',
      isPrivate: d.is_private || false,
      notes: d.notes,
      status: d.status || 'ACTIVE',
      createdAt: d.created_at
    }));

    // 10. Fetch savings goals
    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const savingsGoals: SavingsGoal[] = (goalsData || []).map((g) => ({
      id: g.id,
      householdId: g.household_id,
      name: g.name,
      icon: g.icon || '🎯',
      imageUrl: g.image_url,
      category: g.category || 'General',
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      startingBalance: Number(g.starting_balance),
      currency: g.currency || '₦',
      targetDate: g.target_date,
      cadence: g.cadence || 'monthly',
      suggestedContribution: Number(g.suggested_contribution),
      ownership: g.ownership || 'joint',
      externalStorageNote: g.external_storage_note,
      isPrivate: g.is_private || false,
      status: g.status || 'ACTIVE',
      createdAt: g.created_at,
      goalAmount: Number(g.target_amount),
      monthlyContribution: Number(g.suggested_contribution)
    }));

    // 11. Fetch income streams
    const { data: incomeData } = await supabase
      .from('income_streams')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    const incomeStreams: IncomeStream[] = (incomeData || []).map((i) => ({
      id: i.id,
      householdId: i.household_id,
      title: i.title,
      category: i.category || 'Salary',
      amount: Number(i.amount),
      currency: i.currency || '₦',
      cadence: i.cadence || 'monthly',
      earnedBy: i.earned_by || 'Shared',
      notes: i.notes,
      status: i.status || 'ACTIVE',
      createdAt: i.created_at
    }));

    const household: Household = {
      id: hh.id,
      name: hh.name,
      inviteCode: hh.invite_code,
      maxMembers: hh.max_members || 2,
      members: members.length > 0 ? members : [foundCurrentUser || { id: 'usr_me', name: 'Partner A', avatarUrl: '', isOnline: true, role: 'partner_a' }],
      relationshipStartDate: hh.relationship_start_date
        ? new Date(hh.relationship_start_date).toISOString().split('T')[0]
        : (hh.created_at ? new Date(hh.created_at).toISOString().split('T')[0] : '2024-04-14'),
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
      folders,
      transactions,
      recurringBills,
      debtAccounts,
      savingsGoals,
      incomeStreams,
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

// -----------------------------------------
// NEW WRITES FOR LIST STUDIO
// -----------------------------------------

export async function saveTaskToDB(task: Task, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  
  const validPriority = (task.priority === 'High' || task.priority === 'Medium' || task.priority === 'Low') 
    ? task.priority 
    : 'Medium';

  const validFolderId = task.folderId && !task.folderId.startsWith('f-') 
    ? task.folderId 
    : null;

  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    household_id: householdId,
    title: task.title,
    description: task.description,
    category: task.category || 'Home',
    is_joint: task.isJoint,
    assigned_to_name: task.assignedToName || 'Both',
    due_date: task.dueDate || 'Today',
    priority: validPriority,
    completed: task.completed ?? false,
    user_a_completed: task.userACompleted ?? false,
    user_b_completed: task.userBCompleted ?? false,
    sub_tasks: task.subTasks || [],
    tags: task.tags || [],
    folder_id: validFolderId,
    completed_by: task.completedBy || null
  });

  if (error) {
    console.warn('Supabase task insert error:', error.message, error.details);
  }
}

export async function updateTaskInDB(taskId: string, updates: Partial<Task>) {
  if (taskId.startsWith('task-')) return; // Ignore local-only mock tasks
  
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.userACompleted !== undefined) dbUpdates.user_a_completed = updates.userACompleted;
  if (updates.userBCompleted !== undefined) dbUpdates.user_b_completed = updates.userBCompleted;
  if (updates.subTasks !== undefined) dbUpdates.sub_tasks = updates.subTasks;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.completedBy !== undefined) dbUpdates.completed_by = updates.completedBy;
  if (updates.folderId !== undefined) {
    dbUpdates.folder_id = updates.folderId && !updates.folderId.startsWith('f-') ? updates.folderId : null;
  }
  if (updates.priority !== undefined) {
    dbUpdates.priority = (updates.priority === 'High' || updates.priority === 'Medium' || updates.priority === 'Low') 
      ? updates.priority 
      : 'Medium';
  }

  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    if (error) {
      console.warn('Supabase task update error:', error.message);
    }
  }
}

export async function deleteTaskFromDB(taskId: string) {
  try {
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch (err) {
    console.warn('Error deleting task from DB:', err);
  }
}

export async function saveFolderToDB(folder: any, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    await supabase.from('task_folders').insert({
      id: folder.id,
      household_id: householdId,
      name: folder.name,
      icon: folder.icon,
      color: folder.color
    });
  } catch (err) {
    console.warn('Error saving folder to DB:', err);
  }
}

export async function deleteFolderFromDB(folderId: string) {
  try {
    await supabase.from('task_folders').delete().eq('id', folderId);
  } catch (err) {
    console.warn('Error deleting folder from DB:', err);
  }
}

// -----------------------------------------
// RECURRING BILLS PERSISTENCE
// -----------------------------------------

export async function saveRecurringBillToDB(bill: RecurringBill, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const { error } = await supabase.from('recurring_bills').insert({
      id: bill.id,
      household_id: householdId,
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      currency: bill.currency || '₦',
      icon: bill.icon || null,
      notes: bill.notes || null,
      frequency: bill.frequency,
      custom_interval_days: bill.customIntervalDays || null,
      next_due_date: bill.nextDueDate,
      paid_by: bill.paidBy,
      split_type: bill.splitType || 'equal',
      split_details: bill.splitDetails || null,
      payment_method: bill.paymentMethod || 'card',
      status: bill.status,
      auto_log_transaction: bill.autoLogTransaction ?? true,
      reminder_days_before: bill.reminderDaysBefore || 1,
      last_paid_date: bill.lastPaidDate || null
    });

    if (error) {
      console.warn('Supabase recurring_bills insert error:', error.message);
    }
  } catch (err) {
    console.warn('Error saving recurring bill to DB:', err);
  }
}

export async function updateRecurringBillInDB(billId: string, updates: Partial<RecurringBill>) {
  if (billId.startsWith('bill-')) return;
  try {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lastPaidDate !== undefined) dbUpdates.last_paid_date = updates.lastPaidDate;
    if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('recurring_bills').update(dbUpdates).eq('id', billId);
      if (error) console.warn('Supabase recurring_bills update error:', error.message);
    }
  } catch (err) {
    console.warn('Error updating recurring bill in DB:', err);
  }
}

export async function deleteRecurringBillFromDB(billId: string) {
  try {
    await supabase.from('recurring_bills').delete().eq('id', billId);
  } catch (err) {
    console.warn('Error deleting recurring bill from DB:', err);
  }
}

// -----------------------------------------
// DEBT ACCOUNTS PERSISTENCE
// -----------------------------------------

export async function saveDebtAccountToDB(debt: DebtAccount, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const { error } = await supabase.from('debt_accounts').insert({
      id: debt.id,
      household_id: householdId,
      name: debt.name,
      category: debt.category,
      lender_name: debt.lenderName || null,
      principal_amount: debt.principalAmount,
      balance: debt.balance,
      rate_type: debt.rateType,
      interest_rate: debt.interestRate,
      effective_apr: debt.effectiveAPR,
      repayment_frequency: debt.repaymentFrequency,
      loan_term_months: debt.loanTermMonths || null,
      repayment_method: debt.repaymentMethod || 'bank_transfer',
      minimum_payment: debt.minimumPayment,
      start_date: debt.startDate || null,
      next_due_date: debt.nextDueDate || debt.dueDate || null,
      currency: debt.currency || '₦',
      paid_by: debt.paidBy,
      is_private: debt.isPrivate || false,
      notes: debt.notes || null,
      status: debt.status
    });

    if (error) {
      console.warn('Supabase debt_accounts insert error:', error.message);
    }
  } catch (err) {
    console.warn('Error saving debt account to DB:', err);
  }
}

export async function updateDebtAccountInDB(debtId: string, updates: Partial<DebtAccount>) {
  if (debtId.startsWith('debt-')) return;
  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.minimumPayment !== undefined) dbUpdates.minimum_payment = updates.minimumPayment;
    if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('debt_accounts').update(dbUpdates).eq('id', debtId);
      if (error) console.warn('Supabase debt_accounts update error:', error.message);
    }
  } catch (err) {
    console.warn('Error updating debt account in DB:', err);
  }
}

export async function deleteDebtAccountFromDB(debtId: string) {
  try {
    await supabase.from('debt_accounts').delete().eq('id', debtId);
  } catch (err) {
    console.warn('Error deleting debt account from DB:', err);
  }
}

export async function logDebtPaymentInDB(payment: DebtPayment) {
  try {
    const { error } = await supabase.from('debt_payments').insert({
      id: payment.id,
      debt_id: payment.debtId,
      amount: payment.amount,
      principal_paid: payment.principalPaid,
      interest_paid: payment.interestPaid,
      payment_date: payment.paymentDate,
      paid_by: payment.paidBy || null
    });
    if (error) console.warn('Supabase debt_payments insert error:', error.message);
  } catch (err) {
    console.warn('Error logging debt payment to DB:', err);
  }
}

// -----------------------------------------
// SAVINGS GOALS PERSISTENCE
// -----------------------------------------

export async function saveSavingsGoalToDB(goal: SavingsGoal, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const { error } = await supabase.from('savings_goals').insert({
      id: goal.id,
      household_id: householdId,
      name: goal.name,
      icon: goal.icon || '🎯',
      image_url: goal.imageUrl || null,
      category: goal.category || 'General',
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount || 0,
      starting_balance: goal.startingBalance || 0,
      currency: goal.currency || '₦',
      target_date: goal.targetDate || null,
      cadence: goal.cadence || 'monthly',
      suggested_contribution: goal.suggestedContribution || 0,
      ownership: goal.ownership || 'joint',
      external_storage_note: goal.externalStorageNote || null,
      is_private: goal.isPrivate || false,
      status: goal.status || 'ACTIVE'
    });

    if (error) {
      console.warn('Supabase savings_goals insert error:', error.message);
    }
  } catch (err) {
    console.warn('Error saving savings goal to DB:', err);
  }
}

export async function updateSavingsGoalInDB(goalId: string, updates: Partial<SavingsGoal>) {
  if (goalId.startsWith('goal-')) return;
  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
    if (updates.suggestedContribution !== undefined) dbUpdates.suggested_contribution = updates.suggestedContribution;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('savings_goals').update(dbUpdates).eq('id', goalId);
      if (error) console.warn('Supabase savings_goals update error:', error.message);
    }
  } catch (err) {
    console.warn('Error updating savings goal in DB:', err);
  }
}

export async function deleteSavingsGoalFromDB(goalId: string) {
  try {
    await supabase.from('savings_goals').delete().eq('id', goalId);
  } catch (err) {
    console.warn('Error deleting savings goal from DB:', err);
  }
}

export async function logSavingsContributionInDB(contribution: SavingsContribution) {
  try {
    const { error } = await supabase.from('savings_contributions').insert({
      id: contribution.id,
      goal_id: contribution.goalId,
      contributor_name: contribution.contributorName,
      amount: contribution.amount,
      contribution_date: contribution.contributionDate,
      note: contribution.note || null
    });
    if (error) console.warn('Supabase savings_contributions insert error:', error.message);
  } catch (err) {
    console.warn('Error logging savings contribution to DB:', err);
  }
}

// -----------------------------------------
// TRANSACTION & INCOME STREAMS PERSISTENCE
// -----------------------------------------

export async function saveTransactionToDB(tx: Transaction, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      household_id: householdId,
      title: tx.title,
      amount: Number(tx.amount || 0),
      type: tx.type || 'EXPENSE',
      category: tx.category || 'Expenses',
      paid_by: tx.paidBy,
      account: tx.account || 'Joint Account',
      is_shared: tx.isShared ?? true
    });
    if (error) console.warn('Supabase transactions insert error:', error.message);
  } catch (err) {
    console.warn('Error saving transaction to DB:', err);
  }
}

export async function updateTransactionInDB(txId: string, updates: Partial<Transaction>) {
  if (txId.startsWith('tx-')) return;
  try {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', txId);
      if (error) console.warn('Supabase transactions update error:', error.message);
    }
  } catch (err) {
    console.warn('Error updating transaction in DB:', err);
  }
}

export async function deleteTransactionFromDB(txId: string) {
  try {
    await supabase.from('transactions').delete().eq('id', txId);
  } catch (err) {
    console.warn('Error deleting transaction from DB:', err);
  }
}

export async function saveIncomeStreamToDB(stream: IncomeStream, householdId: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const { error } = await supabase.from('income_streams').insert({
      id: stream.id,
      household_id: householdId,
      title: stream.title,
      category: stream.category,
      amount: stream.amount,
      currency: stream.currency || '₦',
      cadence: stream.cadence || 'monthly',
      earned_by: stream.earnedBy,
      notes: stream.notes || null,
      status: stream.status || 'ACTIVE'
    });
    if (error) console.warn('Supabase income_streams insert error:', error.message);
  } catch (err) {
    console.warn('Error saving income stream to DB:', err);
  }
}

export async function updateIncomeStreamInDB(streamId: string, updates: Partial<IncomeStream>) {
  if (streamId.startsWith('inc-')) return;
  try {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('income_streams').update(dbUpdates).eq('id', streamId);
      if (error) console.warn('Supabase income_streams update error:', error.message);
    }
  } catch (err) {
    console.warn('Error updating income stream in DB:', err);
  }
}

export async function deleteIncomeStreamFromDB(streamId: string) {
  try {
    await supabase.from('income_streams').delete().eq('id', streamId);
  } catch (err) {
    console.warn('Error deleting income stream from DB:', err);
  }
}

export async function updateHouseholdStartDateInDB(householdId: string, startDate: string) {
  if (!householdId || householdId.startsWith('hh_')) return;
  try {
    const isoDate = new Date(startDate).toISOString();
    const { error } = await supabase.from('households').update({
      relationship_start_date: isoDate,
      created_at: isoDate
    }).eq('id', householdId);
    if (error) {
      console.warn('Error updating relationship_start_date in DB:', error.message);
    }
  } catch (err) {
    console.warn('Error updating relationship start date in DB:', err);
  }
}

export async function updateUserPresenceInDB(userId: string, isOnline: boolean) {
  if (!userId || userId.startsWith('usr_')) return;
  try {
    await supabase.from('profiles').update({
      is_online: isOnline,
      last_seen_at: new Date().toISOString()
    }).eq('id', userId);
  } catch (err) {
    console.warn('Error updating user presence in DB:', err);
  }
}


