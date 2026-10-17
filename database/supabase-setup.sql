-- Run once for a new Supabase project. Existing projects should apply only
-- the relevant one-time scripts in database/migrations/.
create table if not exists public.athlete_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 1 and 100),
  team text not null check (team in ('Boys', 'Girls')),
  event text check (event is null or length(event) <= 80),
  batch text check (batch is null or length(batch) <= 30),
  photo_url text check (photo_url is null or length(photo_url) <= 500),
  bio text check (bio is null or length(bio) <= 600),
  created_at timestamptz not null default now()
);

alter table public.athletes
  add column if not exists owner_user_id uuid references auth.users (id) on delete set null;

create unique index if not exists athletes_owner_user_id_unique
  on public.athletes (owner_user_id)
  where owner_user_id is not null;

create table if not exists public.athlete_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Team member' check (length(trim(full_name)) between 1 and 100),
  email text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.athletics_records (
  id uuid primary key default gen_random_uuid(),
  team text not null check (team in ('boys', 'girls')),
  record_type text not null constraint athletics_records_record_type_format
    check (record_type ~ '^[a-z][a-z0-9_]{1,39}$'),
  event text not null check (
    event in (
      '100m', '200m', '400m', '800m', '1500m', '5000m',
      '110m H', '400m H', '100m H',
      'Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault',
      'Shot Put', 'Discus', 'Javelin', 'Hammer',
      '4×100m Relay', '4×400m Relay', '4×400m Mixed Relay'
    )
  ),
  athlete text not null check (length(trim(athlete)) between 1 and 300),
  record_label text not null check (length(trim(record_label)) between 1 and 80),
  college text not null default '' check (length(college) <= 100),
  performance text not null check (length(trim(performance)) between 1 and 50),
  created_at timestamptz not null default now()
);

alter table public.athletics_records
  drop constraint if exists athletics_records_record_type_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.athletics_records'::regclass
      and conname = 'athletics_records_record_type_format'
  ) then
    alter table public.athletics_records
      add constraint athletics_records_record_type_format
      check (record_type ~ '^[a-z][a-z0-9_]{1,39}$');
  end if;
end
$$;

insert into public.athletics_records (team, record_type, event, athlete, record_label, college, performance)
select seed.team, seed.record_type, seed.event, seed.athlete, seed.record_label, seed.college, seed.performance
from (values
  ('boys', 'inter_iit', '100m', 'Shivam Singh', '2019', 'IIT Kharagpur', '10.8s'),
  ('boys', 'inter_iit', '100m', 'Pawan Dahiya', '2017', 'IIT Bombay', '10.8s'),
  ('boys', 'inter_iit', '100m', 'Dileep Pudi', '2016', 'IIT Delhi', '10.8s'),
  ('boys', 'inter_iit', '200m', 'Pawan Dahiya', '2017', 'IIT Bombay', '22.0s'),
  ('boys', 'inter_iit', '400m', 'Pawan Dahiya', '2017', 'IIT Bombay', '49.1s'),
  ('boys', 'inter_iit', '800m', 'Dileep Pudi', '2017', 'IIT Delhi', '1:56.4s'),
  ('boys', 'inter_iit', '1500m', 'C George', '1980', 'IIT Madras', '4:04.3s'),
  ('boys', 'inter_iit', '5000m', 'Narendra Kumar Khichar', '2019', 'IIT Kharagpur', '16:06.2s'),
  ('boys', 'inter_iit', '110m H', 'Narendra Kumar', '1972', 'IIT Madras', '15.6s'),
  ('boys', 'inter_iit', '400m H', 'Narendra Kumar', '1972', 'IIT Madras', '56.0s'),
  ('boys', 'inter_iit', 'Long Jump', 'Saurabhdeep Singh Deopuri', '2018', 'IIT Delhi', '6.75m'),
  ('boys', 'inter_iit', 'Triple Jump', 'Shubham Yadav', '2019', 'IIT Delhi', '14.16m'),
  ('boys', 'inter_iit', 'High Jump', 'CK Soorya', '2024', 'IIT Guwahati', '1.95m'),
  ('boys', 'inter_iit', 'Pole Vault', 'Gaurav Yadav', '2025', 'IIT Madras', '4.00m'),
  ('boys', 'inter_iit', 'Shot Put', 'Dalit Singh', '1973', 'IIT Delhi', '13.33m'),
  ('boys', 'inter_iit', 'Discus', 'Ankit Lakhlan', '2022', 'IIT Roorkee', '40.97m'),
  ('boys', 'inter_iit', 'Javelin', 'Amgoth Ganesh', '2025', 'IIT Roorkee', '57.07m'),
  ('boys', 'inter_iit', 'Hammer', 'Aman Pal', '2017', 'IIT Roorkee', '45.3m'),
  ('boys', 'inter_iit', '4×100m Relay', 'Gnaneshwar Munoth · Md Zaid · Indrajeet Kumar · Rohan N', '2025', 'IIT Kharagpur', '43.17s'),
  ('boys', 'inter_iit', '4×400m Relay', 'Ainsley Fernandes · Shlok Rathi · Raj Singh Yadav · Amit Kumar', '2025', 'IIT Bombay', '3:24.60s'),
  ('boys', 'institute', '100m', 'Deepak Jorwal (Y14)', 'Inter IIT''17', 'IIT Madras', '11.0s'),
  ('boys', 'institute', '200m', 'Neeli Ajay Chandra (Y16)', 'Inter IIT''19', 'IIT Kharagpur', '22.3s'),
  ('boys', 'institute', '400m', 'Neeli Ajay Chandra (Y16)', 'Inter IIT''19', 'IIT Kharagpur', '49.6s'),
  ('boys', 'institute', '800m', 'Jaswinder Singh (Y15)', 'Inter IIT''17', 'IIT Madras', '1:56.9s'),
  ('boys', 'institute', '1500m', 'Jaswinder Singh (Y15)', 'Udghosh''17', 'IIT Kanpur', '4:16.00s'),
  ('boys', 'institute', '5000m', 'Dhananjay De (Y19)', 'Inter IIT''24', 'IIT Indore', '16:09.43s'),
  ('boys', 'institute', '110m H', 'Yuvraj Singh Khare (Y21)', 'Udghosh''25', 'IIT Kanpur', '15.69s'),
  ('boys', 'institute', '400m H', 'Akshat Verma', 'Spardha''15', 'IIT BHU', '57.0s'),
  ('boys', 'institute', 'Long Jump', 'M Surya Prakash', 'Udghosh''14', 'IIT Kanpur', '6.43m'),
  ('boys', 'institute', 'Triple Jump', 'Akshat Verma', 'Udghosh''15', 'IIT Kanpur', '13.51m'),
  ('boys', 'institute', 'High Jump', 'Lokesh Yadav (Y14)', 'Inter IIT''18', 'IIT Guwahati', '1.84m'),
  ('boys', 'institute', 'Pole Vault', 'Sagar Yadav (Y14)', 'Inter IIT''17', 'IIT Madras', '3.70m'),
  ('boys', 'institute', 'Shot Put', 'Shubham Yadav (Y12)', 'Sportech''16', 'IIT Delhi', '12.3m'),
  ('boys', 'institute', 'Discus', 'Balamurugan Ganesan', 'Inter IIT''18', 'IIT Guwahati', '36.5m'),
  ('boys', 'institute', 'Javelin', 'Shivam Kumar', 'Inter IIT''14', 'IIT Bombay', '55.54m'),
  ('boys', 'institute', 'Hammer', 'Shubham Yadav (Y12)', 'Sportech''16', 'IIT Delhi', '42m'),
  ('boys', 'institute', '4×100m Relay', 'Neeli Ajay Chandra (Y16) · Mohit · Deepak Jorwal (Y14) · Pranav', 'Inter IIT''17', 'IIT Madras', '43.75s'),
  ('boys', 'institute', '4×400m Relay', 'Sachin Nehra (Y18) · Abhijeet (Y17) · Bhaskar Lamba (Y18) · Neeli Ajay Chandra (Y16)', 'Inter IIT''19', 'IIT Kharagpur', '3:24.8s'),
  ('girls', 'inter_iit', '100m', 'Sanjana Reddy', '2025', 'IIT Kharagpur', '13.12s'),
  ('girls', 'inter_iit', '200m', 'Sanjana Reddy', '2025', 'IIT Kharagpur', '27.49s'),
  ('girls', 'inter_iit', '400m', 'Sanjana Reddy', '2025', 'IIT Kharagpur', '1:01.75s'),
  ('girls', 'inter_iit', '800m', 'Lavanya', '2024', 'IIT Roorkee', '2:26.11s'),
  ('girls', 'inter_iit', '1500m', 'Lavanya', '2024', 'IIT Roorkee', '5:20.32s'),
  ('girls', 'inter_iit', '100m H', 'Saga Biju Lona', '2025', 'IIT Madras', '18.50s'),
  ('girls', 'inter_iit', 'Long Jump', 'Karishma Singh', '2025', 'IIT Kanpur', '4.99m'),
  ('girls', 'inter_iit', 'High Jump', 'Karunya Bhaskar', '2017', 'IIT Bombay', '1.41m'),
  ('girls', 'inter_iit', 'Shot Put', 'Anjali Kumari', '2023', 'IIT Delhi', '10.23m'),
  ('girls', 'inter_iit', 'Discus', 'Anjali Kumari', '2023', 'IIT Delhi', '35.26m'),
  ('girls', 'inter_iit', 'Javelin', 'Tanuja Painkra', '2024', 'IIT Guwahati', '28.51m'),
  ('girls', 'inter_iit', '4×100m Relay', 'Biri Yachu · Jangili Poojitha · Paligiri Meghana · Sanjana Reddy', '2025', 'IIT Kharagpur', '54.35s'),
  ('girls', 'inter_iit', '4×400m Relay', 'Biri Yachu · Paligiri Meghana · Jangili Poojitha · Sanjana Reddy', '2025', 'IIT Kharagpur', '4:21.78s'),
  ('girls', 'inter_iit', '4×400m Mixed Relay', 'Indrajeet Kumar · Poojitha Jangili · Gnaneshwar Munoth · Sanjana Reddy', '2025', 'IIT Kharagpur', '3:49.44s'),
  ('girls', 'institute', '100m', 'Karishma Singh (Y24)', 'Sportech''26', 'IIT Delhi', '13.66s'),
  ('girls', 'institute', '200m', 'Mutyala Devi (Y12)', 'Inter IIT''13', 'IIT Guwahati', '28.1s'),
  ('girls', 'institute', '400m', 'Mutyala Devi (Y12)', 'Inter IIT''13', 'IIT Guwahati', '1:07.2s'),
  ('girls', 'institute', '800m', 'Asha Burdak (Y15)', 'Inter IIT''17', 'IIT Madras', '2:42.0s'),
  ('girls', 'institute', '1500m', 'Meghna Jakhar (Y18)', 'Inter IIT''19', 'IIT Kharagpur', '5:31.7s'),
  ('girls', 'institute', '100m H', 'Karishma Singh (Y24)', 'Sportech''26', 'IIT Delhi', '18.42s'),
  ('girls', 'institute', 'Long Jump', 'Karishma Singh (Y24)', 'Inter IIT''25', 'IIT Hyderabad', '4.99m'),
  ('girls', 'institute', 'High Jump', 'Mounika (Y25)', 'Sportech''26', 'IIT Delhi', '1.41m'),
  ('girls', 'institute', 'Shot Put', 'Kavita Yadav', 'Inter IIT''17', 'IIT Madras', '9.02m'),
  ('girls', 'institute', 'Discus', 'Arpita Verma (Y25)', 'Udghosh''26', 'IIT Kanpur', '26.9m'),
  ('girls', 'institute', 'Javelin', 'Arpita Verma (Y25)', 'Udghosh''26', 'IIT Kanpur', '27.51m'),
  ('girls', 'institute', 'Hammer', 'Meenakshi Meena (Y25)', 'Udghosh''26', 'IIT Kanpur', '25.57m'),
  ('girls', 'institute', '4×100m Relay', 'Aradhana Ananya (Y25) · Priyanshi Meena (Y24) · Karishma Singh (Y24)', 'Inter IIT''25', 'IIT Hyderabad', '55.28s'),
  ('girls', 'institute', '4×400m Relay', 'Priyanshi Meena (Y24) · P Movika (Y23) · Samiera R Nair (Y23) · Karishma Singh (Y24)', 'Inter IIT''25', 'IIT Hyderabad', '4:34.22s'),
  ('girls', 'institute', '4×400m Mixed Relay', 'Anuj Kumar Gupta (Y23) · Priyanshi Meena (Y24) · Anukalp Raj (Y22) · Karishma Singh (Y23)', 'Inter IIT''25', 'IIT Hyderabad', '4:04.62s')
) as seed(team, record_type, event, athlete, record_label, college, performance)
where not exists (
  select 1
  from public.athletics_records as saved
  where saved.team = seed.team
    and saved.record_type = seed.record_type
    and saved.event = seed.event
    and saved.athlete = seed.athlete
    and saved.record_label = seed.record_label
    and saved.college = seed.college
    and saved.performance = seed.performance
);

alter table public.athlete_admins enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_members enable row level security;
alter table public.athletics_records enable row level security;

create or replace function public.is_athlete_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_athlete_admin() from public;
grant execute on function public.is_athlete_admin() to authenticated;

create or replace function public.is_approved_athlete_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_members as member
    join auth.users as account on account.id = member.user_id
    where member.user_id = (select auth.uid())
      and member.status = 'approved'
      and account.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_approved_athlete_member() from public;
grant execute on function public.is_approved_athlete_member() to authenticated;

create or replace function public.add_pending_athlete_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.athlete_members (user_id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Team member'),
    coalesce(new.email, '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.add_pending_athlete_member() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_add_athlete_member on auth.users;
create trigger on_auth_user_created_add_athlete_member
after insert on auth.users
for each row execute function public.add_pending_athlete_member();

insert into public.athlete_members (user_id, full_name, email)
select
  account.id,
  coalesce(nullif(trim(account.raw_user_meta_data ->> 'full_name'), ''), 'Team member'),
  coalesce(account.email, '')
from auth.users as account
where not exists (
  select 1
  from public.athlete_admins as admin
  where admin.user_id = account.id
)
on conflict (user_id) do nothing;

revoke all on public.athlete_admins from anon, authenticated;
grant select on public.athlete_admins to authenticated;

revoke all on public.athletes from anon, authenticated;
grant select, insert, update, delete on public.athletes to authenticated;

revoke all on public.athlete_members from anon, authenticated;
grant select, update on public.athlete_members to authenticated;

revoke all on public.athletics_records from anon, authenticated;
grant select on public.athletics_records to anon, authenticated;
grant insert, update, delete on public.athletics_records to authenticated;

drop policy if exists "Anyone can read athletics records" on public.athletics_records;
create policy "Anyone can read athletics records"
on public.athletics_records
for select
to anon, authenticated
using (true);

drop policy if exists "Athlete admins can add athletics records" on public.athletics_records;
create policy "Athlete admins can add athletics records"
on public.athletics_records
for insert
to authenticated
with check ((select public.is_athlete_admin()));

drop policy if exists "Athlete admins can update athletics records" on public.athletics_records;
create policy "Athlete admins can update athletics records"
on public.athletics_records
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));

drop policy if exists "Athlete admins can delete athletics records" on public.athletics_records;
create policy "Athlete admins can delete athletics records"
on public.athletics_records
for delete
to authenticated
using ((select public.is_athlete_admin()));

drop policy if exists "Athlete admins can read their own admin entry" on public.athlete_admins;
create policy "Athlete admins can read their own admin entry"
on public.athlete_admins
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Athlete admins can read profiles" on public.athletes;
create policy "Athlete admins can read profiles"
on public.athletes
for select
to authenticated
using ((select public.is_athlete_admin()) or (select public.is_approved_athlete_member()));

drop policy if exists "Athlete admins can create profiles" on public.athletes;
create policy "Athlete admins can create profiles"
on public.athletes
for insert
to authenticated
with check (
  (select public.is_athlete_admin())
  or (
    (select public.is_approved_athlete_member())
    and owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Athlete admins can update profiles" on public.athletes;
create policy "Athlete admins can update profiles"
on public.athletes
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));

drop policy if exists "Approved members can update their own profile" on public.athletes;
create policy "Approved members can update their own profile"
on public.athletes
for update
to authenticated
using (
  (select public.is_approved_athlete_member())
  and owner_user_id = (select auth.uid())
)
with check (
  (select public.is_approved_athlete_member())
  and owner_user_id = (select auth.uid())
);

drop policy if exists "Athlete admins can delete profiles" on public.athletes;
create policy "Athlete admins can delete profiles"
on public.athletes
for delete
to authenticated
using ((select public.is_athlete_admin()));

drop policy if exists "Members can read their own membership" on public.athlete_members;
create policy "Members can read their own membership"
on public.athlete_members
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_athlete_admin()));

drop policy if exists "Admins can approve or reject team members" on public.athlete_members;
create policy "Admins can approve or reject team members"
on public.athlete_members
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));
