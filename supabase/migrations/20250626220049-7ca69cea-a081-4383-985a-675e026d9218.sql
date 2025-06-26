
-- Remover a constraint antiga do tipo
ALTER TABLE public.prison_units_extended DROP CONSTRAINT IF EXISTS prison_units_extended_type_check;

-- Criar nova constraint com os tipos padronizados
ALTER TABLE public.prison_units_extended 
ADD CONSTRAINT prison_units_extended_type_check 
CHECK (type IN ('UPR', 'CPP', 'Presídio Estadual', 'Penitenciária Feminina', 'CDP', 'Presídio'));

-- Opcional: Atualizar valores antigos para os novos padrões
UPDATE public.prison_units_extended 
SET type = CASE 
  WHEN type = 'CDP' THEN 'CPP'
  WHEN type = 'Presídio' THEN 'Presídio Estadual'
  ELSE type
END
WHERE type IN ('CDP', 'Presídio');
