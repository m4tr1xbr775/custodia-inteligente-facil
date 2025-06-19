
-- Renomear a tabela regions para serventias
ALTER TABLE public.regions RENAME TO serventias;

-- Atualizar todas as referências de foreign keys para a nova tabela
ALTER TABLE public.audiences RENAME COLUMN region_id TO serventia_id;
ALTER TABLE public.schedule_assignments RENAME COLUMN region_id TO serventia_id;
ALTER TABLE public.prison_units_extended RENAME COLUMN region_id TO serventia_id;

-- Atualizar as constraints de foreign key para referenciar a nova tabela
ALTER TABLE public.audiences DROP CONSTRAINT IF EXISTS audiences_region_id_fkey;
ALTER TABLE public.audiences ADD CONSTRAINT audiences_serventia_id_fkey 
  FOREIGN KEY (serventia_id) REFERENCES public.serventias(id);

ALTER TABLE public.schedule_assignments DROP CONSTRAINT IF EXISTS schedule_assignments_region_id_fkey;
ALTER TABLE public.schedule_assignments ADD CONSTRAINT schedule_assignments_serventia_id_fkey 
  FOREIGN KEY (serventia_id) REFERENCES public.serventias(id);

ALTER TABLE public.prison_units_extended DROP CONSTRAINT IF EXISTS prison_units_extended_region_id_fkey;
ALTER TABLE public.prison_units_extended ADD CONSTRAINT prison_units_extended_serventia_id_fkey 
  FOREIGN KEY (serventia_id) REFERENCES public.serventias(id);

-- Atualizar o enum region_type para serventia_type
ALTER TYPE public.region_type RENAME TO serventia_type;

-- Atualizar a coluna type na tabela serventias
ALTER TABLE public.serventias ALTER COLUMN type TYPE serventia_type USING type::text::serventia_type;
