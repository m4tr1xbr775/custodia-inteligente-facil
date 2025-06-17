
-- Criar a tabela schedules que estava faltando
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('ativa', 'inativa', 'rascunho')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar a tabela schedule_assignments para atribuições de plantão
CREATE TABLE IF NOT EXISTS public.schedule_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES public.regions(id),
  magistrate_id UUID REFERENCES public.magistrates(id),
  prosecutor_id UUID REFERENCES public.prosecutors(id),
  defender_id UUID REFERENCES public.defenders(id),
  date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('diurno', 'noturno', 'integral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, region_id, date, shift)
);

-- Atualizar a tabela regions para incluir os campos corretos
ALTER TABLE public.regions 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS responsible TEXT;

-- Adicionar trigger para updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON public.schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_assignments_updated_at ON public.schedule_assignments;
CREATE TRIGGER update_schedule_assignments_updated_at 
    BEFORE UPDATE ON public.schedule_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas regiões de exemplo se não existirem
INSERT INTO public.regions (name, code, type, responsible, phone) 
VALUES 
  ('Macrorregião 02', 'MR02', 'macrorregiao', 'Fernanda Braz', '556299953335'),
  ('Central de Custódia 01', 'CC01', 'central_custodia', 'Carla Martins C. Oliveira', '556299815567')
ON CONFLICT DO NOTHING;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo por enquanto para desenvolvimento)
CREATE POLICY "Allow all operations on schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on schedule_assignments" ON public.schedule_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on regions" ON public.regions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on magistrates" ON public.magistrates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on prosecutors" ON public.prosecutors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on defenders" ON public.defenders FOR ALL USING (true) WITH CHECK (true);
