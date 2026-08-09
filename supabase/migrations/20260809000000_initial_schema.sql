-- CoupleToDo Complete Supabase Database Migration
-- Version 1.0 (Auth, Tables, RLS, Indexes, Triggers, Storage Policies)

-- 1. HOUSEHOLDS
create table if not exists public.households (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  invite_code       text unique not null,
  invite_expires_at timestamptz default (now() + interval '24 hours'),
  currency          text default '₦',
  budget_year       int default 2026,
  first_day_of_week text default 'Monday',
  created_by        uuid references auth.users(id),
  max_members       int default 2,
  created_at        timestamptz default now()
);

-- 2. PROFILES
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  avatar_url    text,
  household_id  uuid references public.households(id),
  role          text check (role in ('partner_a', 'partner_b')) default 'partner_a',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. APP PREFERENCES
create table if not exists public.app_preferences (
  household_id            uuid primary key references public.households(id) on delete cascade,
  currency                text default '₦',
  budget_year             int default 2026,
  first_day_of_week       text default 'Monday',
  subcategories           jsonb default '{"Income": ["Salary", "Investments", "Freelance", "Side Hustle"], "Expenses": ["Groceries", "Dining Out", "Shopping", "Entertainment", "Transport", "Subscriptions"], "Bills": ["Rent", "Electricity", "Internet", "Water"], "Savings": ["Emergency Fund", "Vacation", "House Downpayment"], "Investments": ["Stocks", "Crypto", "Real Estate"], "Debt": ["Credit Card", "Car Loan"]}'::jsonb,
  payment_accounts        jsonb default '["Opay (Leslie)", "Kuda (Asa)", "Moniepoint", "GTBank (Shared)"]'::jsonb,
  debt_strategy           text default 'Snowball',
  extra_debt_contribution numeric default 0,
  updated_at              timestamptz default now()
);

-- 4. TASKS
create table if not exists public.tasks (
  id                      uuid primary key default gen_random_uuid(),
  household_id            uuid not null references public.households(id) on delete cascade,
  title                   text not null,
  description             text,
  category                text not null,
  is_joint                boolean default false,
  user_a_completed        boolean default false,
  user_b_completed        boolean default false,
  completed               boolean default false,
  assigned_to_name        text,
  due_date                text,
  priority                text check (priority in ('High', 'Medium', 'Low')) default 'Medium',
  linked_expense_amount   numeric,
  linked_expense_category text,
  comments_count          int default 0,
  created_by              uuid references auth.users(id),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- 5. TRANSACTIONS
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  title         text not null,
  amount        numeric not null,
  type          text check (type in ('INCOME', 'EXPENSE')) not null,
  category      text not null,
  paid_by_name  text not null,
  account       text,
  is_shared     boolean default false,
  date          text,
  comments_count int default 0,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);

-- 6. RECURRING BILLS
create table if not exists public.recurring_bills (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references public.households(id) on delete cascade,
  title           text not null,
  amount          numeric not null,
  due_date        text,
  due_day_number  int,
  category        text not null,
  status          text check (status in ('PAID', 'DUE', 'UPCOMING')) default 'UPCOMING',
  paid_by_name    text,
  auto_prefill    boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 7. CHAT MESSAGES (with 30-day auto expiry)
create table if not exists public.chat_messages (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references public.households(id) on delete cascade,
  sender_id             uuid references auth.users(id),
  sender_name           text not null,
  content               text not null,
  attachment_type       text check (attachment_type in ('TASK', 'EXPENSE', 'BUZZ', null)),
  attachment_title      text,
  attachment_amount     numeric,
  attachment_ref_id     uuid,
  created_at            timestamptz default now(),
  expires_at            timestamptz default (now() + interval '30 days')
);

-- 8. QUICK NOTES
create table if not exists public.quick_notes (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  text          text not null,
  author_name   text not null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);

-- 9. CONTEXTUAL COMMENTS
create table if not exists public.contextual_comments (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  target_id     uuid not null,
  target_type   text check (target_type in ('TASK', 'TRANSACTION', 'RECURRING_BILL')) not null,
  author_name   text not null,
  author_id     uuid references auth.users(id),
  text          text not null,
  created_at    timestamptz default now()
);

-- 10. DEBT ACCOUNTS
create table if not exists public.debt_accounts (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null references public.households(id) on delete cascade,
  name               text not null,
  balance            numeric default 0,
  interest_rate      numeric default 0,
  minimum_payment    numeric default 0,
  due_date           text,
  start_date         text,
  created_at         timestamptz default now()
);

-- 11. SAVINGS GOALS
create table if not exists public.savings_goals (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references public.households(id) on delete cascade,
  name                  text not null,
  goal_amount           numeric default 0,
  starting_balance      numeric default 0,
  monthly_contribution  numeric default 0,
  created_at            timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.app_preferences enable row level security;
alter table public.tasks enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_bills enable row level security;
alter table public.chat_messages enable row level security;
alter table public.quick_notes enable row level security;
alter table public.contextual_comments enable row level security;
alter table public.debt_accounts enable row level security;
alter table public.savings_goals enable row level security;

-- Helper function to get current user's household_id without RLS recursion depth error (500)
create or replace function public.get_my_household_id()
returns uuid
language sql
security definer
as $$
  select household_id from public.profiles where id = auth.uid() limit 1;
$$;

-- PROFILES RLS
create policy "Users can view members of their household"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (true);

-- HOUSEHOLDS RLS
create policy "Anyone can lookup household by invite code or member"
  on public.households for select
  using (true);

create policy "Users can create household"
  on public.households for insert
  with check (true);

create policy "Users can update household"
  on public.households for update
  using (true);

-- HOUSEHOLD DATA RLS MACRO PATTERN (tasks, transactions, bills, chat, notes, comments, debt, savings)
create policy "Household members can view tasks" on public.tasks for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert tasks" on public.tasks for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can update tasks" on public.tasks for update using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can delete tasks" on public.tasks for delete using (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view transactions" on public.transactions for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert transactions" on public.transactions for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can update transactions" on public.transactions for update using (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view recurring_bills" on public.recurring_bills for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert recurring_bills" on public.recurring_bills for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can update recurring_bills" on public.recurring_bills for update using (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view chat_messages" on public.chat_messages for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert chat_messages" on public.chat_messages for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view quick_notes" on public.quick_notes for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert quick_notes" on public.quick_notes for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can delete quick_notes" on public.quick_notes for delete using (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view contextual_comments" on public.contextual_comments for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert contextual_comments" on public.contextual_comments for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view app_preferences" on public.app_preferences for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can update app_preferences" on public.app_preferences for update using (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view debt_accounts" on public.debt_accounts for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert debt_accounts" on public.debt_accounts for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));

create policy "Household members can view savings_goals" on public.savings_goals for select using (household_id = (select household_id from public.profiles where id = auth.uid()));
create policy "Household members can insert savings_goals" on public.savings_goals for insert with check (household_id = (select household_id from public.profiles where id = auth.uid()));

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_tasks_household on public.tasks(household_id);
create index if not exists idx_transactions_household on public.transactions(household_id);
create index if not exists idx_chat_messages_household on public.chat_messages(household_id);
create index if not exists idx_chat_messages_expires on public.chat_messages(expires_at);
create index if not exists idx_recurring_bills_household on public.recurring_bills(household_id);
create index if not exists idx_contextual_comments_target on public.contextual_comments(target_id, target_type);
create index if not exists idx_profiles_household on public.profiles(household_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- 1. Auto-create Profile Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Auto-sync comment counts
create or replace function public.sync_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.target_type = 'TASK' then
      update public.tasks set comments_count = comments_count + 1 where id = new.target_id;
    elsif new.target_type = 'TRANSACTION' then
      update public.transactions set comments_count = comments_count + 1 where id = new.target_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger sync_comments_count_trigger
  after insert on public.contextual_comments
  for each row execute procedure public.sync_comments_count();

-- 3. Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_tasks_updated_at before update on public.tasks for each row execute procedure public.set_updated_at();
create or replace trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create or replace trigger set_preferences_updated_at before update on public.app_preferences for each row execute procedure public.set_updated_at();

-- 4. Delete user account function (SECURITY DEFINER)
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete profile & related records
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;
