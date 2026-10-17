begin;

do $$
begin
  if to_regclass('public.athletics_records') is null then
    raise exception 'public.athletics_records does not exist. For a fresh project, run database/supabase-setup.sql once first.';
  end if;
end
$$;

alter table public.athletics_records
  drop constraint if exists athletics_records_record_type_check,
  drop constraint if exists athletics_records_record_type_format;

alter table public.athletics_records
  add constraint athletics_records_record_type_format
  check (record_type ~ '^[a-z][a-z0-9_]{1,39}$');

commit;
