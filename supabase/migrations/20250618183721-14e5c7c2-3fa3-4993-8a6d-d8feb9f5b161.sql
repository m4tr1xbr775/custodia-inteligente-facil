
-- Habilitar RLS na tabela audiences se ainda não estiver habilitado
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos possam inserir audiências (sem autenticação necessária por enquanto)
CREATE POLICY "Allow public insert on audiences" 
ON public.audiences 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir que todos possam visualizar audiências
CREATE POLICY "Allow public select on audiences" 
ON public.audiences 
FOR SELECT 
USING (true);

-- Política para permitir que todos possam atualizar audiências
CREATE POLICY "Allow public update on audiences" 
ON public.audiences 
FOR UPDATE 
USING (true);

-- Política para permitir que todos possam deletar audiências
CREATE POLICY "Allow public delete on audiences" 
ON public.audiences 
FOR DELETE 
USING (true);
