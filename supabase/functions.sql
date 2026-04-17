-- Funciones auxiliares (ejecutar después de schema.sql)

create or replace function public.increment_memorial_views(m_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.memorials
    set view_count = view_count + 1
  where id = m_id and status = 'publicado';
$$;

grant execute on function public.increment_memorial_views(uuid) to anon, authenticated;
