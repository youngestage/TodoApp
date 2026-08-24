-- Create task_folders table
CREATE TABLE IF NOT EXISTS public.task_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_folders
ALTER TABLE public.task_folders ENABLE ROW LEVEL SECURITY;

-- Create policy for task_folders
CREATE POLICY "Users can manage task folders in their household"
    ON public.task_folders
    FOR ALL
    USING (
        household_id IN (
            SELECT household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Alter tasks table to add new columns
ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS sub_tasks JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.task_folders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS completed_by TEXT;
