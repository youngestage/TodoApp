-- Debt Accounts Table
CREATE TABLE IF NOT EXISTS public.debt_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'bank_loan',
    lender_name TEXT,
    principal_amount NUMERIC NOT NULL DEFAULT 0,
    balance NUMERIC NOT NULL DEFAULT 0,
    rate_type TEXT NOT NULL DEFAULT 'flat_monthly',
    interest_rate NUMERIC NOT NULL DEFAULT 0,
    effective_apr NUMERIC NOT NULL DEFAULT 0,
    repayment_frequency TEXT NOT NULL DEFAULT 'monthly',
    loan_term_months INT,
    repayment_method TEXT DEFAULT 'bank_transfer',
    minimum_payment NUMERIC NOT NULL DEFAULT 0,
    start_date TEXT,
    next_due_date TEXT,
    currency TEXT DEFAULT '₦',
    paid_by TEXT DEFAULT 'Shared',
    is_private BOOLEAN DEFAULT false,
    notes TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt Payments History Table
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debt_accounts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    principal_paid NUMERIC NOT NULL,
    interest_paid NUMERIC NOT NULL,
    payment_date TEXT NOT NULL,
    paid_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.debt_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for debt_accounts
CREATE POLICY "Users can manage debt accounts in their household"
    ON public.debt_accounts
    FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Create policy for debt_payments
CREATE POLICY "Users can manage debt payments in their household"
    ON public.debt_payments
    FOR ALL
    USING (
        debt_id IN (
            SELECT id FROM public.debt_accounts WHERE household_id IN (
                SELECT household_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );
