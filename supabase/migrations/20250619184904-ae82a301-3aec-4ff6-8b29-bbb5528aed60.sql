
-- Adicionar coluna judicial_assistant_id na tabela schedule_assignments
ALTER TABLE public.schedule_assignments 
ADD COLUMN IF NOT EXISTS judicial_assistant_id uuid REFERENCES public.contacts(id);

-- Criar índice para melhor performance se não existir
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_judicial_assistant 
ON public.schedule_assignments(judicial_assistant_id);
