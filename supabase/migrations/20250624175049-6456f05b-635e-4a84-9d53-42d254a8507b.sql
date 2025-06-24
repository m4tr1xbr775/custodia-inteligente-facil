
-- Criar a tabela magistrate_assistants_history que está faltando
CREATE TABLE IF NOT EXISTS public.magistrate_assistants_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  magistrate_id UUID NOT NULL REFERENCES public.magistrates(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlinked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER magistrate_assistants_history_updated_at
  BEFORE UPDATE ON public.magistrate_assistants_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar a tabela permissions para controle granular de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource, action)
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar função para lidar com assessores sem referência recursiva
CREATE OR REPLACE FUNCTION public.manage_assistant_magistrate_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se está sendo criado um novo vínculo
  IF NEW.linked_magistrate_id IS NOT NULL AND (OLD.linked_magistrate_id IS NULL OR OLD.linked_magistrate_id != NEW.linked_magistrate_id) THEN
    -- Finalizar vínculo anterior se existir
    IF OLD.linked_magistrate_id IS NOT NULL THEN
      UPDATE public.magistrate_assistants_history 
      SET unlinked_at = now()
      WHERE assistant_id = NEW.id 
      AND magistrate_id = OLD.linked_magistrate_id 
      AND unlinked_at IS NULL;
    END IF;
    
    -- Criar novo registro no histórico
    INSERT INTO public.magistrate_assistants_history (assistant_id, magistrate_id, created_by)
    VALUES (NEW.id, NEW.linked_magistrate_id, auth.uid());
  END IF;
  
  -- Se está removendo vínculo
  IF NEW.linked_magistrate_id IS NULL AND OLD.linked_magistrate_id IS NOT NULL THEN
    UPDATE public.magistrate_assistants_history 
    SET unlinked_at = now()
    WHERE assistant_id = NEW.id 
    AND magistrate_id = OLD.linked_magistrate_id 
    AND unlinked_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar ou recriar o trigger para vincular assessores
DROP TRIGGER IF EXISTS manage_assistant_magistrate_link_trigger ON public.contacts;
CREATE TRIGGER manage_assistant_magistrate_link_trigger
  AFTER UPDATE OF linked_magistrate_id ON public.contacts
  FOR EACH ROW
  WHEN (NEW.profile = 'Assessor de Juiz')
  EXECUTE FUNCTION public.manage_assistant_magistrate_link();

-- Atualizar a edge function de exclusão para lidar com vínculos
CREATE OR REPLACE FUNCTION public.handle_user_deletion_with_links(contact_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contact_record public.contacts%ROWTYPE;
BEGIN
  -- Buscar o registro do contato
  SELECT * INTO contact_record FROM public.contacts WHERE id = contact_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contato não encontrado';
  END IF;
  
  -- Se for assessor, remover vínculos primeiro
  IF contact_record.profile = 'Assessor de Juiz' THEN
    -- Finalizar histórico de vínculos
    UPDATE public.magistrate_assistants_history 
    SET unlinked_at = now()
    WHERE assistant_id = contact_id AND unlinked_at IS NULL;
    
    -- Remover referências na tabela magistrates
    UPDATE public.magistrates 
    SET judicial_assistant_id = NULL 
    WHERE judicial_assistant_id = contact_id;
  END IF;
  
  -- Remover permissões
  DELETE FROM public.permissions WHERE user_id = contact_id;
  
  -- Remover notificações
  DELETE FROM public.notifications WHERE user_id = contact_id OR target_user_id = contact_id;
  
  RETURN TRUE;
END;
$$;
