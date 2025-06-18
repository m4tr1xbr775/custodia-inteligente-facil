
-- Limpar dados desnecessários e reorganizar estrutura
DROP TABLE IF EXISTS region_schedules CASCADE;

-- Adicionar campos necessários na tabela audiences se não existirem
ALTER TABLE audiences 
ADD COLUMN IF NOT EXISTS audience_slot_time TIME,
ADD COLUMN IF NOT EXISTS central_region_type TEXT DEFAULT 'central';

-- Criar tabela para os slots de horários das unidades prisionais (pauta automática diária)
CREATE TABLE IF NOT EXISTS prison_unit_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prison_unit_id UUID NOT NULL REFERENCES prison_units(id) ON DELETE CASCADE,
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

-- Política RLS permissiva
CREATE POLICY "Allow all operations on prison_unit_slots" ON prison_unit_slots 
FOR ALL USING (true) WITH CHECK (true);

-- Função para gerar slots automáticos para uma unidade prisional em uma data específica
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

-- Função para gerar slots para todas as unidades prisionais de uma data específica
CREATE OR REPLACE FUNCTION generate_daily_slots_all_units(slot_date DATE)
RETURNS VOID AS $$
DECLARE
  unit_record RECORD;
BEGIN
  FOR unit_record IN SELECT id FROM prison_units
  LOOP
    PERFORM generate_daily_slots_for_unit(unit_record.id, slot_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Gerar slots para hoje e próximos 30 dias
SELECT generate_daily_slots_all_units(CURRENT_DATE + i) 
FROM generate_series(0, 30) i;

-- Adicionar campo para identificar se a audiência foi confirmada pela unidade
ALTER TABLE audiences 
ADD COLUMN IF NOT EXISTS unit_acknowledgment TEXT DEFAULT 'pendente'; -- 'pendente', 'confirmado', 'negado'

-- Remover campos desnecessários se existirem
ALTER TABLE audiences 
DROP COLUMN IF EXISTS unit_confirmed,
DROP COLUMN IF EXISTS unit_confirmed_at,
DROP COLUMN IF EXISTS unit_confirmed_by,
DROP COLUMN IF EXISTS duration_minutes;
