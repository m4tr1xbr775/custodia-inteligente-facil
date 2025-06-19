
-- Adicionar chave estrangeira entre audiences e prison_units_extended
ALTER TABLE audiences 
ADD CONSTRAINT audiences_prison_unit_id_fkey 
FOREIGN KEY (prison_unit_id) 
REFERENCES prison_units_extended(id);
