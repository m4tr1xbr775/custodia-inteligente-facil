
-- Criar tabela de logs do sistema
CREATE TABLE public.system_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  user_id uuid REFERENCES auth.users(id),
  user_name text,
  changes jsonb,
  old_values jsonb,
  new_values jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  description text
);

-- Habilitar RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para administradores lerem todos os logs
CREATE POLICY "Admins can view all logs" ON public.system_logs
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE user_id = auth.uid() 
      AND profile = 'Administrador' 
      AND active = true
    )
  );

-- Política para inserção de logs (sistema interno)
CREATE POLICY "System can insert logs" ON public.system_logs
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Função para registrar logs
CREATE OR REPLACE FUNCTION public.log_system_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_name text;
  log_description text;
BEGIN
  -- Buscar nome do usuário atual
  SELECT name INTO current_user_name
  FROM public.contacts 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Se não encontrar nome, usar email do auth
  IF current_user_name IS NULL THEN
    SELECT email INTO current_user_name
    FROM auth.users 
    WHERE id = auth.uid()
    LIMIT 1;
  END IF;
  
  -- Definir descrição baseada na operação
  IF TG_OP = 'INSERT' THEN
    log_description := format('Criou novo registro na tabela %s', TG_TABLE_NAME);
  ELSIF TG_OP = 'UPDATE' THEN
    log_description := format('Atualizou registro na tabela %s', TG_TABLE_NAME);
  ELSIF TG_OP = 'DELETE' THEN
    log_description := format('Excluiu registro da tabela %s', TG_TABLE_NAME);
  END IF;
  
  -- Inserir log
  INSERT INTO public.system_logs (
    action,
    table_name,
    record_id,
    user_id,
    user_name,
    old_values,
    new_values,
    description
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    auth.uid(),
    COALESCE(current_user_name, 'Sistema'),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    log_description
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar triggers para as tabelas principais
CREATE TRIGGER log_contacts_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();

CREATE TRIGGER log_schedules_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();

CREATE TRIGGER log_audiences_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.audiences
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();

CREATE TRIGGER log_magistrates_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.magistrates
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();

CREATE TRIGGER log_prosecutors_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.prosecutors
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();

CREATE TRIGGER log_defenders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.defenders
  FOR EACH ROW EXECUTE FUNCTION public.log_system_change();
