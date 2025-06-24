
-- Primeiro, vamos remover a constraint existente
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_target_user_id_fkey;

-- Recriar a constraint com DELETE CASCADE para que quando um contato for excluído,
-- as notificações relacionadas também sejam excluídas automaticamente
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_target_user_id_fkey 
FOREIGN KEY (target_user_id) 
REFERENCES public.contacts(id) 
ON DELETE CASCADE;

-- Também vamos garantir que a constraint do user_id nas notificações seja CASCADE
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.contacts(id) 
ON DELETE CASCADE;
