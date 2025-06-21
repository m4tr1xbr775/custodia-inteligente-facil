
-- Verificar se o usuário existe na tabela contacts
SELECT 
    c.id,
    c.user_id,
    c.name,
    c.email,
    c.profile,
    c.active,
    c.created_at
FROM public.contacts c 
WHERE c.email = 'm4tr1xbr@gmail.com';

-- Atualizar o registro existente para garantir que está ativo e com perfil correto
UPDATE public.contacts 
SET 
    profile = 'Administrador',
    active = true,
    updated_at = now()
WHERE email = 'm4tr1xbr@gmail.com';
