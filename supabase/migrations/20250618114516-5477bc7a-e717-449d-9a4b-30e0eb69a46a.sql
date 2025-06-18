
-- Adicionar campos para controle de horários e confirmação das unidades
ALTER TABLE audiences 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS unit_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS unit_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unit_confirmed_by TEXT;

-- Criar tabela para definir horários de funcionamento das centrais/regiões
CREATE TABLE IF NOT EXISTS region_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 6=sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(region_id, day_of_week)
);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_region_schedules_updated_at ON region_schedules;
CREATE TRIGGER update_region_schedules_updated_at
  BEFORE UPDATE ON region_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir horários padrão para todas as regiões existentes (8h às 18h, seg-sex)
INSERT INTO region_schedules (region_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT 
  r.id as region_id,
  dow as day_of_week,
  '08:00:00'::TIME as start_time,
  '18:00:00'::TIME as end_time,
  60 as slot_duration_minutes
FROM regions r
CROSS JOIN generate_series(1, 5) as dow -- Segunda a sexta
WHERE NOT EXISTS (
  SELECT 1 FROM region_schedules rs 
  WHERE rs.region_id = r.id AND rs.day_of_week = dow
);

-- Habilitar RLS
ALTER TABLE region_schedules ENABLE ROW LEVEL SECURITY;

-- Política RLS para permitir acesso
CREATE POLICY "Allow all operations on region_schedules" ON region_schedules 
FOR ALL USING (true) WITH CHECK (true);
