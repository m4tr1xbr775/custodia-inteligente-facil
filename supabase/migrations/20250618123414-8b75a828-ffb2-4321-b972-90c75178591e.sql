
-- Criar tabela para as unidades prisionais com todos os campos necessários
CREATE TABLE public.prison_units_extended (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  short_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('CDP', 'Presídio', 'CPP')),
  comarca text NOT NULL,
  director text NOT NULL,
  responsible text NOT NULL,
  landline text NOT NULL,
  functional text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  current_population integer NOT NULL DEFAULT 0 CHECK (current_population >= 0),
  address text NOT NULL,
  municipalities text NOT NULL,
  region_id uuid REFERENCES public.regions(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_prison_units_extended_updated_at
  BEFORE UPDATE ON public.prison_units_extended
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.prison_units_extended ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso público (ajuste conforme necessário)
CREATE POLICY "Allow public access to prison_units_extended" 
  ON public.prison_units_extended 
  FOR ALL 
  USING (true);

-- Inserir algumas unidades de exemplo baseadas no layout
INSERT INTO public.prison_units_extended (
  name, short_name, type, comarca, director, responsible, 
  landline, functional, whatsapp, email, capacity, current_population, 
  address, municipalities
) VALUES 
(
  'Centro de Detenção Provisória de Aparecida de Goiânia',
  'CDP Aparecida',
  'CDP',
  'Aparecida de Goiânia',
  'Dr. João Silva',
  'Inspetor José Santos',
  '(62) 3201-4444',
  '(62) 3201-4445',
  '(62) 99999-4444',
  'cdp.aparecida@dgap.go.gov.br',
  850,
  720,
  'Av. Presidente Vargas, 1000 - Aparecida de Goiânia/GO',
  'Aparecida de Goiânia, Senador Canedo, Bela Vista de Goiás'
),
(
  'Presídio Feminino de Goiânia',
  'Presídio Feminino',
  'Presídio',
  'Goiânia',
  'Dra. Maria Fernanda Costa',
  'Inspetora Maria José Silva',
  '(62) 3201-5555',
  '(62) 3201-5556',
  '(62) 99999-5555',
  'presidio.feminino@dgap.go.gov.br',
  400,
  380,
  'Rua das Flores, 500 - Goiânia/GO',
  'Goiânia, Trindade, Goianira'
);
