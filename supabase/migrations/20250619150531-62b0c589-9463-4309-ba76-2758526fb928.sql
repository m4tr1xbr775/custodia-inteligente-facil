
-- Criar políticas RLS para a tabela contacts
CREATE POLICY "Allow public insert on contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on contacts" 
ON public.contacts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on contacts" 
ON public.contacts 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on contacts" 
ON public.contacts 
FOR DELETE 
USING (true);
