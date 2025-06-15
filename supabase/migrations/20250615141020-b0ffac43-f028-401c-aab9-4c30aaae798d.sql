
-- Criar enum para tipos de região
CREATE TYPE public.region_type AS ENUM ('macrorregiao', 'central_custodia');

-- Criar enum para status das audiências
CREATE TYPE public.audience_status AS ENUM ('agendada', 'realizada', 'cancelada', 'nao_compareceu');

-- Tabela de regiões (Macrorregiões e Centrais de Custódia)
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type region_type NOT NULL,
  responsible TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de unidades prisionais
CREATE TABLE public.prison_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id) NOT NULL,
  address TEXT,
  phone TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de magistrados
CREATE TABLE public.magistrates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de promotores
CREATE TABLE public.prosecutors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de defensores
CREATE TABLE public.defenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration TEXT,
  email TEXT,
  phone TEXT,
  type TEXT, -- público, privado, dativo
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de policiais penais responsáveis
CREATE TABLE public.police_officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration TEXT,
  rank TEXT,
  unit_id UUID REFERENCES public.prison_units(id),
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela principal de audiências
CREATE TABLE public.audiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_number TEXT NOT NULL,
  defendant_name TEXT NOT NULL,
  defendant_document TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  region_id UUID REFERENCES public.regions(id) NOT NULL,
  prison_unit_id UUID REFERENCES public.prison_units(id) NOT NULL,
  magistrate_id UUID REFERENCES public.magistrates(id),
  prosecutor_id UUID REFERENCES public.prosecutors(id),
  defender_id UUID REFERENCES public.defenders(id),
  police_officer_id UUID REFERENCES public.police_officers(id),
  virtual_room_url TEXT,
  status audience_status NOT NULL DEFAULT 'agendada',
  confirmed_by_unit BOOLEAN DEFAULT false,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contatos (para página de contatos)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  region_id UUID REFERENCES public.regions(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados iniciais das regiões
INSERT INTO public.regions (code, name, type, responsible, phone) VALUES
('macrorregiao_02', 'Macrorregião 02', 'macrorregiao', 'Dr. João Silva', '(62) 3201-2002'),
('macrorregiao_03', 'Macrorregião 03', 'macrorregiao', 'Dra. Maria Santos', '(62) 3201-2003'),
('macrorregiao_04', 'Macrorregião 04', 'macrorregiao', 'Dr. Pedro Costa', '(62) 3201-2004'),
('macrorregiao_05', 'Macrorregião 05', 'macrorregiao', 'Dra. Ana Oliveira', '(62) 3201-2005'),
('central_custodia_01', 'Central de Custódia 01', 'central_custodia', 'Dr. Carlos Lima', '(62) 3201-3001'),
('central_custodia_03', 'Central de Custódia 03', 'central_custodia', 'Dra. Fernanda Rocha', '(62) 3201-3003'),
('central_custodia_04', 'Central de Custódia 04', 'central_custodia', 'Dr. Roberto Alves', '(62) 3201-3004');

-- Inserir algumas unidades prisionais de exemplo
INSERT INTO public.prison_units (name, region_id, address, phone) VALUES
('CDP Aparecida de Goiânia', (SELECT id FROM public.regions WHERE code = 'macrorregiao_02'), 'Aparecida de Goiânia, GO', '(62) 3277-1234'),
('Presídio Feminino', (SELECT id FROM public.regions WHERE code = 'central_custodia_01'), 'Goiânia, GO', '(62) 3277-5678'),
('CPP Goiânia', (SELECT id FROM public.regions WHERE code = 'central_custodia_03'), 'Goiânia, GO', '(62) 3277-9012'),
('Casa de Prisão Provisória - Anápolis', (SELECT id FROM public.regions WHERE code = 'macrorregiao_03'), 'Anápolis, GO', '(62) 3277-3456');

-- Habilitar Row Level Security
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prison_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magistrates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prosecutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir leitura para todos os usuários autenticados por enquanto)
CREATE POLICY "Allow read access to regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to prison_units" ON public.prison_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to magistrates" ON public.magistrates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to prosecutors" ON public.prosecutors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to defenders" ON public.defenders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to police_officers" ON public.police_officers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to audiences" ON public.audiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to contacts" ON public.contacts FOR SELECT TO authenticated USING (true);

-- Políticas para inserção e atualização (apenas usuários autenticados)
CREATE POLICY "Allow insert to audiences" ON public.audiences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update to audiences" ON public.audiences FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow insert to contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update to contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);
