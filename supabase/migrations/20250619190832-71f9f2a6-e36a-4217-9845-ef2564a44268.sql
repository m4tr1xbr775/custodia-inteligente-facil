
-- Remover a constraint incorreta que aponta para magistrates
ALTER TABLE public.audiences 
DROP CONSTRAINT IF EXISTS audiences_judicial_assistant_id_fkey;

-- Adicionar a constraint correta que aponta para contacts
ALTER TABLE public.audiences 
ADD CONSTRAINT audiences_judicial_assistant_id_fkey 
FOREIGN KEY (judicial_assistant_id) REFERENCES public.contacts(id);
