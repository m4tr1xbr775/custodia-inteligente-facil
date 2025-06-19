
-- Adicionar coluna judicial_assistant_id na tabela schedule_assignments
ALTER TABLE public.schedule_assignments 
ADD COLUMN judicial_assistant_id uuid REFERENCES public.contacts(id);

-- Criar índice para melhor performance
CREATE INDEX idx_schedule_assignments_judicial_assistant 
ON public.schedule_assignments(judicial_assistant_id);
