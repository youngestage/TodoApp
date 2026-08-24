-- Recurring Bills & Subscriptions Table Upgrade
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT '₦',
    icon TEXT,
    notes TEXT,
    frequency TEXT NOT NULL DEFAULT 'monthly',
    custom_interval_days INT,
    next_due_date TEXT NOT NULL,
    paid_by TEXT DEFAULT 'Shared',
    split_type TEXT DEFAULT 'equal',
    split_details JSONB DEFAULT '{"partnerA": 50, "partnerB": 50}'::jsonb,
    payment_method TEXT DEFAULT 'card',
    status TEXT DEFAULT 'UPCOMING',
    auto_log_transaction BOOLEAN DEFAULT true,
    reminder_days_before INT DEFAULT 1,
    last_paid_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on recurring_bills
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;

-- Create policy for recurring_bills
CREATE POLICY "Users can manage recurring bills in their household"
    ON public.recurring_bills
    FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM public.profiles WHERE id = auth.uid()
        )
    );
