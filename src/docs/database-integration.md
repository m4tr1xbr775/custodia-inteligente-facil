
# Integração do Banco de Dados - SisJud

## Estrutura Atual do Banco de Dados

### Tabelas Ativas

#### 1. **prison_units_extended** 
- **Uso**: Gerenciamento completo de unidades prisionais
- **Página**: `/unidades` (src/pages/Unidades.tsx)
- **Componentes**: UnidadeForm.tsx
- **Campos principais**: name, short_name, type, comarca, director, responsible, landline, functional, whatsapp, email, capacity, current_population, address, municipalities
- **Relacionamentos**: Referenciada por audiences e prison_unit_slots

#### 2. **audiences**
- **Uso**: Agendamento de audiências de custódia
- **Página**: `/audiencias` (src/pages/Audiencias.tsx)
- **Componentes**: AudienciaForm.tsx
- **Campos principais**: defendant_name, process_number, scheduled_date, scheduled_time, region_id, prison_unit_id, status
- **Relacionamentos**: Referencia regions, prison_units_extended, magistrates, prosecutors, defenders

#### 3. **regions**
- **Uso**: Definição de regiões/centrais de custódia
- **Página**: `/configuracoes` (gerenciamento de regiões)
- **Componentes**: RegionManagement.tsx
- **Campos principais**: name, code, type, responsible, phone
- **Relacionamentos**: Referenciada por audiences, contacts, schedule_assignments

#### 4. **magistrates**
- **Uso**: Cadastro de magistrados para plantão
- **Página**: `/configuracoes` (gerenciamento de usuários)
- **Componentes**: UserManagement.tsx
- **Campos principais**: name, registration, phone, email, active
- **Relacionamentos**: Referenciada por schedule_assignments

#### 5. **prosecutors**
- **Uso**: Cadastro de promotores para plantão
- **Página**: `/configuracoes` (gerenciamento de usuários)
- **Componentes**: UserManagement.tsx
- **Campos principais**: name, registration, phone, email, active
- **Relacionamentos**: Referenciada por schedule_assignments

#### 6. **defenders**
- **Uso**: Cadastro de defensores para plantão
- **Página**: `/configuracoes` (gerenciamento de usuários)
- **Componentes**: UserManagement.tsx
- **Campos principais**: name, registration, phone, email, active, type
- **Relacionamentos**: Referenciada por schedule_assignments

#### 7. **schedules**
- **Uso**: Criação de escalas de plantão
- **Página**: `/configuracoes` (gerenciamento de escalas)
- **Componentes**: ScheduleManagement.tsx
- **Campos principais**: title, description, start_date, end_date, status
- **Relacionamentos**: Referenciada por schedule_assignments

#### 8. **schedule_assignments**
- **Uso**: Atribuições específicas de plantão por data/região
- **Página**: `/configuracoes` (gerenciamento de atribuições)
- **Componentes**: AssignmentManagement.tsx
- **Campos principais**: schedule_id, region_id, magistrate_id, prosecutor_id, defender_id, date, shift
- **Relacionamentos**: Referencia schedules, regions, magistrates, prosecutors, defenders

#### 9. **contacts**
- **Uso**: Lista de contatos do sistema
- **Página**: `/contatos` (src/pages/Contatos.tsx)
- **Campos principais**: name, position, department, phone, mobile, email, region_id
- **Relacionamentos**: Referencia regions

#### 10. **prison_unit_slots**
- **Uso**: Gerenciamento de horários disponíveis nas unidades
- **Componentes**: AudienciaForm.tsx (para seleção de horários)
- **Campos principais**: prison_unit_id, date, time, is_available, audience_id
- **Relacionamentos**: Referencia prison_units_extended e audiences

## Integrações por Página

### Dashboard (`/`)
- **Tabelas consultadas**: audiences, prison_units_extended, regions
- **Finalidade**: Estatísticas e visão geral do sistema

### Audiências (`/audiencias`)
- **Tabelas principais**: audiences
- **Tabelas relacionadas**: regions, prison_units_extended, prison_unit_slots, schedule_assignments, magistrates, prosecutors, defenders
- **Funcionalidades**: CRUD completo de audiências com agendamento automático

### Unidades Prisionais (`/unidades`)
- **Tabela principal**: prison_units_extended
- **Funcionalidades**: CRUD completo de unidades prisionais

### Plantões (`/plantoes`)
- **Tabelas consultadas**: schedule_assignments, schedules, regions, magistrates, prosecutors, defenders
- **Finalidade**: Visualização de escalas de plantão

### Contatos (`/contatos`)
- **Tabela principal**: contacts
- **Tabelas relacionadas**: regions
- **Funcionalidades**: Listagem e busca de contatos

### Configurações (`/configuracoes`)
- **Todas as tabelas do sistema** para gerenciamento administrativo
- **Componentes**:
  - RegionManagement: regions
  - UserManagement: magistrates, prosecutors, defenders
  - ScheduleManagement: schedules
  - AssignmentManagement: schedule_assignments

## Funções de Banco de Dados

### 1. **generate_daily_slots_for_unit(unit_id, slot_date)**
- **Finalidade**: Gera slots de horário (15 em 15 min, 09:00-18:00) para uma unidade em uma data específica
- **Uso**: Automação de disponibilidade de horários

### 2. **generate_daily_slots_all_units(slot_date)**
- **Finalidade**: Gera slots para todas as unidades em uma data específica
- **Uso**: Preparação automática da agenda

### 3. **update_updated_at_column()**
- **Finalidade**: Trigger para atualizar automaticamente o campo updated_at
- **Uso**: Auditoria de modificações

## Status de RLS (Row Level Security)

- **Habilitado**: Todas as tabelas têm RLS ativado
- **Políticas**: Atualmente configuradas como permissivas (allow all) para desenvolvimento
- **Recomendação**: Implementar políticas mais restritivas em produção

## Tabelas Removidas na Limpeza

- **prison_units**: Removida (duplicada, substituída por prison_units_extended)
- **police_officers**: Removida (não utilizada no sistema)

## Próximos Passos Recomendados

1. **Implementar autenticação** para ativar RLS adequadamente
2. **Criar políticas RLS específicas** por tipo de usuário
3. **Implementar auditoria** com logs de modificações
4. **Adicionar validações** nos triggers de banco
5. **Criar índices** para otimizar consultas frequentes
