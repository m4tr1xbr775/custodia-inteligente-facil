
-- Limpar tabelas não utilizadas e duplicadas

-- 1. Remover tabela prison_units antiga (duplicada)
-- Primeiro, verificar se há referências e removê-las
DELETE FROM prison_unit_slots WHERE prison_unit_id IN (SELECT id FROM prison_units);
DROP TABLE IF EXISTS prison_unit_slots;
DROP TABLE IF EXISTS prison_units CASCADE;

-- 2. Remover tabela police_officers (não utilizada no app)
DROP TABLE IF EXISTS police_officers CASCADE;

-- 3. Recriar prison_unit_slots referenciando a tabela correta
CREATE TABLE IF NOT EXISTS prison_unit_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prison_unit_id UUID NOT NULL REFERENCES prison_units_extended(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  audience_id UUID REFERENCES audiences(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prison_unit_id, date, time)
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_prison_unit_slots_updated_at
  BEFORE UPDATE ON prison_unit_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE prison_unit_slots ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Allow all operations on prison_unit_slots" ON prison_unit_slots 
FOR ALL USING (true) WITH CHECK (true);

-- 4. Atualizar referências nas audiências para usar prison_units_extended
-- Primeiro, verificar se há audiências que referenciam a tabela antiga
UPDATE audiences 
SET prison_unit_id = NULL 
WHERE prison_unit_id NOT IN (SELECT id FROM prison_units_extended);

-- 5. Atualizar funções para usar a tabela correta
CREATE OR REPLACE FUNCTION generate_daily_slots_for_unit(unit_id UUID, slot_date DATE)
RETURNS VOID AS $$
DECLARE
  slot_time TIME;
BEGIN
  -- Gerar slots de 09:00 às 18:00 com intervalos de 15 minutos
  FOR slot_time IN 
    SELECT time '09:00:00' + (interval '15 minutes' * generate_series(0, 35))
  LOOP
    INSERT INTO prison_unit_slots (prison_unit_id, date, time, is_available)
    VALUES (unit_id, slot_date, slot_time, TRUE)
    ON CONFLICT (prison_unit_id, date, time) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_daily_slots_all_units(slot_date DATE)
RETURNS VOID AS $$
DECLARE
  unit_record RECORD;
BEGIN
  FOR unit_record IN SELECT id FROM prison_units_extended
  LOOP
    PERFORM generate_daily_slots_for_unit(unit_record.id, slot_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Limpar dados órfãos em outras tabelas
-- Remover contatos sem região válida
DELETE FROM contacts WHERE region_id IS NOT NULL AND region_id NOT IN (SELECT id FROM regions);

-- Remover schedule_assignments sem referências válidas
DELETE FROM schedule_assignments 
WHERE schedule_id NOT IN (SELECT id FROM schedules)
   OR region_id NOT IN (SELECT id FROM regions);
