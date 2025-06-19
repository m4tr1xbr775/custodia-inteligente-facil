
-- Remover coluna defendant_document da tabela audiences
ALTER TABLE public.audiences DROP COLUMN IF EXISTS defendant_document;

-- Adicionar coluna para assistente de juiz
ALTER TABLE public.audiences ADD COLUMN judicial_assistant_id uuid REFERENCES public.magistrates(id);

-- Adicionar coluna para armazenar o link da sala virtual do magistrado
ALTER TABLE public.magistrates ADD COLUMN IF NOT EXISTS virtual_room_url text;
