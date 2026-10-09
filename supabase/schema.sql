-- Run once in the Supabase SQL editor. Enable anonymous sign-ins in Auth settings.
create table if not exists public.portal_records (
  player_id uuid not null references auth.users(id) on delete cascade,
  zone_id integer not null check (zone_id between 0 and 7),
  nickname text not null check (char_length(nickname) between 1 and 20),
  team text not null check (team in ('dragon','unicorn')),
  value bigint not null check (value > 0 and value <= 86400000),
  created_at timestamptz not null default now(),
  primary key (player_id, zone_id)
);
alter table public.portal_records enable row level security;
revoke all on public.portal_records from anon, authenticated;

create or replace function public.portal_top_ten()
returns table(zone_id integer, player_id uuid, nickname text, team text, value bigint, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select r.zone_id,r.player_id,r.nickname,r.team,r.value,r.created_at from (
    select p.*, row_number() over(partition by p.zone_id order by p.value desc,p.created_at,p.player_id) as position
    from public.portal_records p
  ) r where r.position<=10 order by r.zone_id,r.position;
$$;
revoke all on function public.portal_top_ten() from public;
grant execute on function public.portal_top_ten() to anon,authenticated;

create or replace function public.portal_submit_record(p_zone integer,p_nickname text,p_team text,p_value bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign-in required'; end if;
  if p_zone not between 0 and 7 or p_value<=0 or p_value>86400000 or p_team not in ('dragon','unicorn') or char_length(trim(p_nickname)) not between 1 and 20 then
    raise exception 'Invalid record';
  end if;
  insert into public.portal_records(player_id,zone_id,nickname,team,value)
  values(auth.uid(),p_zone,trim(p_nickname),p_team,p_value)
  on conflict(player_id,zone_id) do update
    set nickname=excluded.nickname,team=excluded.team,value=excluded.value,created_at=now()
    where excluded.value>public.portal_records.value;
end;
$$;
revoke all on function public.portal_submit_record(integer,text,text,bigint) from public,anon;
grant execute on function public.portal_submit_record(integer,text,text,bigint) to authenticated;
