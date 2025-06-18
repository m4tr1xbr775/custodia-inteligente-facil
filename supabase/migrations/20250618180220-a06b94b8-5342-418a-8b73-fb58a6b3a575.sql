
-- Função para gerar slots automáticos para uma unidade prisional em uma data específica
CREATE OR REPLACE FUNCTION generate_daily_slots_for_unit(unit_id UUID, slot_date DATE)
RETURNS VOID AS $$
DECLARE
  slot_time TIME;
BEGIN
  -- Gerar slots de 09:00 às 18:00 com intervalos de 15 minutos (36 slots total)
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
  FOR unit_record IN SELECT id FROM prison_units_extended
  LOOP
    PERFORM generate_daily_slots_for_unit(unit_record.id, slot_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Gerar slots para hoje e próximos 30 dias para todas as unidades
SELECT generate_daily_slots_all_units(CURRENT_DATE + i) 
FROM generate_series(0, 30) i;

-- Função para gerar slots automaticamente para os próximos dias (útil para automação)
CREATE OR REPLACE FUNCTION generate_future_slots(days_ahead INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  slots_created INTEGER := 0;
  i INTEGER;
BEGIN
  FOR i IN 0..days_ahead LOOP
    PERFORM generate_daily_slots_all_units(CURRENT_DATE + i);
    slots_created := slots_created + 1;
  END LOOP;
  
  RETURN 'Slots criados para ' || slots_created || ' dias para todas as unidades prisionais';
END;
$$ LANGUAGE plpgsql;

-- Trigger para marcar slot como indisponível quando uma audiência for agendada
CREATE OR REPLACE FUNCTION mark_slot_unavailable()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma audiência é inserida ou atualizada, marcar o slot como indisponível
  IF NEW.prison_unit_id IS NOT NULL AND NEW.scheduled_date IS NOT NULL AND NEW.scheduled_time IS NOT NULL THEN
    UPDATE prison_unit_slots 
    SET is_available = FALSE, 
        audience_id = NEW.id
    WHERE prison_unit_id = NEW.prison_unit_id 
      AND date = NEW.scheduled_date 
      AND time = NEW.scheduled_time::TIME;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para liberar slot quando audiência for removida ou alterada
CREATE OR REPLACE FUNCTION free_slot_on_audience_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se audiência foi deletada, liberar o slot
  IF TG_OP = 'DELETE' THEN
    UPDATE prison_unit_slots 
    SET is_available = TRUE, 
        audience_id = NULL
    WHERE prison_unit_id = OLD.prison_unit_id 
      AND date = OLD.scheduled_date 
      AND time = OLD.scheduled_time::TIME;
    RETURN OLD;
  END IF;
  
  -- Se horário ou unidade mudou, liberar slot antigo
  IF OLD.prison_unit_id != NEW.prison_unit_id OR 
     OLD.scheduled_date != NEW.scheduled_date OR 
     OLD.scheduled_time != NEW.scheduled_time THEN
    
    UPDATE prison_unit_slots 
    SET is_available = TRUE, 
        audience_id = NULL
    WHERE prison_unit_id = OLD.prison_unit_id 
      AND date = OLD.scheduled_date 
      AND time = OLD.scheduled_time::TIME;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers na tabela audiences
DROP TRIGGER IF EXISTS trigger_mark_slot_unavailable ON audiences;
CREATE TRIGGER trigger_mark_slot_unavailable
  AFTER INSERT OR UPDATE ON audiences
  FOR EACH ROW EXECUTE FUNCTION mark_slot_unavailable();

DROP TRIGGER IF EXISTS trigger_free_slot_on_change ON audiences;
CREATE TRIGGER trigger_free_slot_on_change
  BEFORE UPDATE OR DELETE ON audiences
  FOR EACH ROW EXECUTE FUNCTION free_slot_on_audience_change();
