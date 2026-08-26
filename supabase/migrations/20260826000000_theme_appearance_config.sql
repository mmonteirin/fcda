-- ============================================================================
-- MIGRATION: Configurações Avançadas de Tema e Aparência
-- ============================================================================
-- Esta migração adiciona suporte para personalização avançada de tema,
-- cores, animações e layout para melhorar a aparência geral do site.
-- ============================================================================

-- Tabela de configurações globais de tema/aparência
create table public.theme_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  category text default 'general', -- 'general', 'colors', 'typography', 'animations', 'layout'
  is_public boolean default true, -- se pode ser acessado por usuários não autenticados
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Tabela de preferências de tema do usuário
create table public.user_theme_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  theme_mode text default 'system', -- 'light', 'dark', 'system'
  accent_color text default 'emerald', -- 'emerald', 'blue', 'purple', 'gold', 'rose'
  font_family text default 'sansation', -- 'sansation', 'system', 'inter'
  font_size text default 'medium', -- 'small', 'medium', 'large'
  animations_enabled boolean default true,
  reduced_motion boolean default false,
  compact_mode boolean default false,
  custom_colors jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- Grants
grant select on public.theme_config to anon, authenticated;
grant insert, update, delete on public.theme_config to authenticated;
grant all on public.theme_config to service_role;

grant select on public.user_theme_preferences to authenticated;
grant insert, update, delete on public.user_theme_preferences to authenticated;
grant all on public.user_theme_preferences to service_role;

-- RLS
alter table public.theme_config enable row level security;

-- Leitura pública para configurações públicas
create policy "public read theme config" on public.theme_config 
  for select to anon, authenticated 
  using (is_public = true or public.has_role(auth.uid(), 'admin'));

-- Escrita restrita a admins
create policy "admins write theme config" on public.theme_config 
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

alter table public.user_theme_preferences enable row level security;

-- Usuários podem ler suas próprias preferências
create policy "users read own theme preferences" on public.user_theme_preferences 
  for select to authenticated 
  using (auth.uid() = user_id);

-- Usuários podem gerenciar suas próprias preferências
create policy "users manage own theme preferences" on public.user_theme_preferences 
  for all to authenticated 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Triggers para updated_at
create trigger theme_config_upd before update on public.theme_config 
  for each row execute function public.tg_set_updated_at();

create trigger user_theme_preferences_upd before update on public.user_theme_preferences 
  for each row execute function public.tg_set_updated_at();

-- ============================================================================
-- DADOS INICIAIS - Configurações Padrão de Tema
-- ============================================================================

-- Cores Principais
insert into public.theme_config (key, value, description, category) values
('colors.primary', '{
  "name": "Esmeralda",
  "value": "oklch(0.48 0.11 165)",
  "foreground": "oklch(0.98 0.02 90)",
  "description": "Cor principal para ações e elementos destacados"
}', 'Cor primária em verde esmeralda', 'colors'),

('colors.secondary', '{
  "name": "Dourado",
  "value": "oklch(0.74 0.12 85)",
  "foreground": "oklch(0.2 0.05 165)",
  "description": "Cor secundária para destaques e acentos"
}', 'Cor secundária em dourado', 'colors'),

('colors.deep', '{
  "name": "Esmeralda Profundo",
  "value": "oklch(0.3 0.07 165)",
  "foreground": "oklch(0.97 0.02 90)",
  "description": "Cor escura para fundos hero e elementos profundos"
}', 'Cor escura em verde esmeralda profundo', 'colors'),

('colors.background', '{
  "name": "Creme Suave",
  "value": "oklch(0.985 0.015 90)",
  "description": "Cor de fundo principal"
}', 'Cor de fundo suave', 'colors'),

('colors.card', '{
  "name": "Branco Puro",
  "value": "oklch(1 0 0)",
  "foreground": "oklch(0.2 0.05 165)",
  "description": "Cor para cards e containers"
}', 'Cor para cards e containers', 'colors');

-- Gradientes
insert into public.theme_config (key, value, description, category) values
('gradients.hero', '{
  "name": "Gradiente Hero",
  "value": "linear-gradient(135deg, oklch(0.3 0.07 165) 0%, oklch(0.2 0.05 165) 60%, oklch(0.15 0.04 165) 100%)",
  "description": "Gradiente para seções hero e headers"
}', 'Gradiente principal para hero sections', 'colors'),

('gradients.emerald', '{
  "name": "Gradiente Esmeralda",
  "value": "linear-gradient(135deg, oklch(0.48 0.11 165) 0%, oklch(0.3 0.07 165) 100%)",
  "description": "Gradiente esmeralda para botões e elementos"
}', 'Gradiente esmeralda para elementos', 'colors'),

('gradients.gold', '{
  "name": "Gradiente Dourado",
  "value": "linear-gradient(135deg, oklch(0.78 0.13 85) 0%, oklch(0.65 0.12 70) 100%)",
  "description": "Gradiente dourado para destaques especiais"
}', 'Gradiente dourado para destaques', 'colors');

-- Sombras
insert into public.theme_config (key, value, description, category) values
('shadows.elegant', '{
  "name": "Sombra Elegante",
  "value": "0 20px 60px -20px oklch(0.3 0.07 165 / 0.35)",
  "description": "Sombra elegante para elementos destacados"
}', 'Sombra elegante e suave', 'colors'),

('shadows.card', '{
  "name": "Sombra Card",
  "value": "0 8px 30px -10px oklch(0.3 0.07 165 / 0.18)",
  "description": "Sombra para cards e containers"
}', 'Sombra para cards', 'colors');

-- Tipografia
insert into public.theme_config (key, value, description, category) values
('typography.font_primary', '{
  "name": "Sansation",
  "family": "Sansation, system-ui, sans-serif",
  "description": "Fonte principal do site"
}', 'Fonte principal Sansation', 'typography'),

('typography.font_display', '{
  "name": "Sansation Display",
  "family": "Sansation, system-ui, sans-serif",
  "description": "Fonte para títulos e displays"
}', 'Fonte para títulos', 'typography'),

('typography.sizes', '{
  "xs": "0.75rem",
  "sm": "0.875rem",
  "base": "1rem",
  "lg": "1.125rem",
  "xl": "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem"
}', 'Tamanhos de fonte padrão', 'typography'),

('typography.weights', '{
  "light": "300",
  "normal": "400",
  "medium": "500",
  "semibold": "600",
  "bold": "700"
}', 'Pesos de fonte disponíveis', 'typography');

-- Animações
insert into public.theme_config (key, value, description, category) values
('animations.default_duration', '{
  "fast": "150ms",
  "normal": "300ms",
  "slow": "500ms"
}', 'Durações padrão de animação', 'animations'),

('animations.easing', '{
  "default": "cubic-bezier(0.4, 0, 0.2, 1)",
  "in": "cubic-bezier(0.4, 0, 1, 1)",
  "out": "cubic-bezier(0, 0, 0.2, 1)",
  "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
}', 'Funções de easing para animações', 'animations'),

('animations.presets', '{
  "fade_in": {
    "from": { "opacity": 0 },
    "to": { "opacity": 1 },
    "duration": "300ms"
  },
  "fade_in_up": {
    "from": { "opacity": 0, "transform": "translateY(20px)" },
    "to": { "opacity": 1, "transform": "translateY(0)" },
    "duration": "600ms"
  },
  "slide_in_right": {
    "from": { "transform": "translateX(100%)" },
    "to": { "transform": "translateX(0)" },
    "duration": "400ms"
  },
  "scale_in": {
    "from": { "transform": "scale(0.9)", "opacity": 0 },
    "to": { "transform": "scale(1)", "opacity": 1 },
    "duration": "300ms"
  }
}', 'Presets de animação reutilizáveis', 'animations');

-- Layout
insert into public.theme_config (key, value, description, category) values
('layout.container_max_width', '{
  "sm": "640px",
  "md": "768px",
  "lg": "1024px",
  "xl": "1280px",
  "2xl": "1536px"
}', 'Larguras máximas de container', 'layout'),

('layout.spacing', '{
  "xs": "0.5rem",
  "sm": "1rem",
  "md": "1.5rem",
  "lg": "2rem",
  "xl": "3rem",
  "2xl": "4rem"
}', 'Espaçamentos padrão', 'layout'),

('layout.border_radius', '{
  "sm": "0.25rem",
  "md": "0.375rem",
  "lg": "0.5rem",
  "xl": "0.75rem",
  "2xl": "1rem",
  "full": "9999px"
}', 'Border radius padrão', 'layout');

-- Configurações gerais
insert into public.theme_config (key, value, description, category) values
('general.animations_enabled', 'true', 'Se animações estão habilitadas por padrão', 'general'),
('general.reduced_motion_support', 'true', 'Suporte a movimento reduzido para acessibilidade', 'general'),
('general.compact_mode_available', 'true', 'Se modo compacto está disponível', 'general'),
('general.theme_presets', '{
  "default": {
    "name": "Padrão FCDA",
    "description": "Tema padrão com cores esmeralda e dourado"
  },
  "minimal": {
    "name": "Minimalista",
    "description": "Tema minimalista com menos cores"
  },
  "high_contrast": {
    "name": "Alto Contraste",
    "description": "Tema com alto contraste para acessibilidade"
  }
}', 'Presets de tema disponíveis', 'general');

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
create index idx_theme_config_category on public.theme_config(category);
create index idx_theme_config_is_public on public.theme_config(is_public);
create index idx_user_theme_preferences_user_id on public.user_theme_preferences(user_id);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter configuração de tema com fallback
create or replace function public.get_theme_config(p_key text, p_default jsonb default '{}'::jsonb)
returns jsonb as $$
begin
  return coalesce(
    (select value from public.theme_config where key = p_key limit 1),
    p_default
  );
end;
$$ language plpgsql security definer;

-- Função para obter preferências de tema do usuário com fallback para padrões
create or replace function public.get_user_theme_preferences(p_user_id uuid)
returns jsonb as $$
declare
  v_preferences jsonb;
  v_defaults jsonb;
begin
  -- Buscar preferências do usuário
  select row_to_json(t) into v_preferences
  from public.user_theme_preferences t
  where user_id = p_user_id;
  
  -- Se não existirem, usar defaults
  if v_preferences is null then
    v_preferences := '{
      "theme_mode": "system",
      "accent_color": "emerald",
      "font_family": "sansation",
      "font_size": "medium",
      "animations_enabled": true,
      "reduced_motion": false,
      "compact_mode": false,
      "custom_colors": {}
    }'::jsonb;
  end if;
  
  return v_preferences;
end;
$$ language plpgsql security definer;

-- Grant para as funções
grant execute on function public.get_theme_config to anon, authenticated;
grant execute on function public.get_user_theme_preferences to authenticated;