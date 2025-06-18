
-- 1. Remover a constraint de consistência entre região e unidade (se existir)
ALTER TABLE audiences DROP CONSTRAINT IF EXISTS fk_audience_region_unit_consistency;

-- 2. Tornar region_id opcional novamente nas unidades (elas atendem todo o estado)
ALTER TABLE prison_units_extended 
ALTER COLUMN region_id DROP NOT NULL;

-- 3. Limpar region_id das unidades para deixar claro que elas atendem todo o estado
UPDATE prison_units_extended 
SET region_id = NULL;

-- 4. Remover a view que vinculava unidades a regiões
DROP VIEW IF EXISTS prison_units_with_regions;

-- 5. Remover a função que gerava slots por região
DROP FUNCTION IF EXISTS public.generate_daily_slots_for_region_units(uuid, date);

-- 6. Criar índices otimizados para a nova lógica
DROP INDEX IF EXISTS idx_prison_units_region;
CREATE INDEX IF NOT EXISTS idx_audiences_region_date ON audiences(region_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_prison_unit_slots_unit_date ON prison_unit_slots(prison_unit_id, date, is_available);
CREATE INDEX IF NOT EXISTS idx_prison_units_active ON prison_units_extended(name) WHERE region_id IS NULL;
