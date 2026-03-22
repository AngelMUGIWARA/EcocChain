-- Function called from the browser (anon key) right after supabase.auth.signUp().
-- SECURITY DEFINER so it bypasses RLS and can insert into public.users with
-- auth.users FK already satisfied by the just-created auth record.
create or replace function public.create_user_profile(
  p_id     uuid,
  p_nombre text,
  p_rol    text,
  p_email  text default null,
  p_wallet text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, nombre, rol, email, wallet_address)
  values (p_id, p_nombre, p_rol, p_email, p_wallet);
end;
$$;

-- Allow anon and authenticated roles to call this function.
grant execute on function public.create_user_profile(uuid, text, text, text, text)
  to anon, authenticated;
