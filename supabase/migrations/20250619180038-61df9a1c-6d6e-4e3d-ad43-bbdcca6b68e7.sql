
-- Renomear a coluna position para profile na tabela contacts
ALTER TABLE public.contacts RENAME COLUMN position TO profile;

-- Atualizar o valor "Assistente de Juiz" para "Assessor de Juiz" em todos os registros existentes
UPDATE public.contacts 
SET profile = 'Assessor de Juiz' 
WHERE profile = 'Assistente de Juiz';
