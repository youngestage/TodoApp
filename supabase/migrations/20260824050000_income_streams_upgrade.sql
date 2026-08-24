-- Income Streams Table
CREATE TABLE IF NOT EXISTS public.income_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Salary',
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT '₦',
    cadence TEXT DEFAULT 'monthly',
    earned_by TEXT DEFAULT 'Shared',
    notes TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.income_streams ENABLE ROW LEVEL SECURITY;

-- Create policy for income_streams
CREATE POLICY "Users can manage income streams in their household"
    ON public.income_streams
    FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM public.profiles WHERE id = auth.uid()
        )
    );
