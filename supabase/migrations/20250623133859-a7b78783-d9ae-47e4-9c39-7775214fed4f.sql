
-- 1. Primeiro, listar e remover todos os triggers relacionados às funções que queremos dropar
DROP TRIGGER IF EXISTS trigger_free_slot_on_change ON audiences;
DROP TRIGGER IF EXISTS trigger_mark_slot_unavailable ON audiences;
DROP TRIGGER IF EXISTS free_slot_on_audience_change_trigger ON audiences;
DROP TRIGGER IF EXISTS mark_slot_unavailable_trigger ON audiences;

-- 2. Agora podemos remover as funções com CASCADE para garantir que dependências sejam removidas
DROP FUNCTION IF EXISTS mark_slot_unavailable() CASCADE;
DROP FUNCTION IF EXISTS free_slot_on_audience_change() CASCADE;
DROP FUNCTION IF EXISTS generate_daily_slots_for_unit(uuid, date) CASCADE;
DROP FUNCTION IF EXISTS generate_daily_slots_all_units(date) CASCADE;
DROP FUNCTION IF EXISTS generate_future_slots(integer) CASCADE;

-- 3. Adicionar constraint única para evitar duplo agendamento na mesma sala
ALTER TABLE audiences
ADD CONSTRAINT uq_prison_unit_date_time UNIQUE (prison_unit_id, scheduled_date, scheduled_time);

-- 4. Adicionar campo para número de salas nas unidades prisionais
ALTER TABLE prison_units_extended
ADD COLUMN number_of_rooms INTEGER NOT NULL DEFAULT 1
CHECK (number_of_rooms > 0);
