
-- Adicionar coluna judicial_assistant_id na tabela magistrates
ALTER TABLE public.magistrates ADD COLUMN judicial_assistant_id uuid REFERENCES public.contacts(id);
