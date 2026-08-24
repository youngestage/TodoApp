-- Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🎯',
    image_url TEXT,
    category TEXT DEFAULT 'General',
    target_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    starting_balance NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT '₦',
    target_date TEXT,
    cadence TEXT DEFAULT 'monthly',
    suggested_contribution NUMERIC DEFAULT 0,
    ownership TEXT DEFAULT 'joint',
    external_storage_note TEXT,
    is_private BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings Contributions Table
CREATE TABLE IF NOT EXISTS public.savings_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    contributor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    contribution_date TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

-- Create policy for savings_goals
CREATE POLICY "Users can manage savings goals in their household"
    ON public.savings_goals
    FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Create policy for savings_contributions
CREATE POLICY "Users can manage savings contributions in their household"
    ON public.savings_contributions
    FOR ALL
    USING (
        goal_id IN (
            SELECT id FROM public.savings_goals WHERE household_id IN (
                SELECT household_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );
