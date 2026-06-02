
-- Fix tg_set_updated_at search_path
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

-- handle_new_user é só usada pelo trigger; revoga execução pública
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Limita listagem do bucket: leitura por path específico ainda funciona via URL pública
drop policy if exists "public read site-images" on storage.objects;
create policy "public read site-images" on storage.objects for select to anon, authenticated
  using (bucket_id = 'site-images' and (storage.foldername(name))[1] is not null);
