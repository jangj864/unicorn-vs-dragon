-- Separate completed 20-card time trials from legacy survival records.
create table if not exists public.portal_memory_records (
  player_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  team text not null check (team in ('dragon','unicorn')),
  value bigint not null check (value > 0 and value <= 86400000),
  created_at timestamptz not null default now()
);
alter table public.portal_memory_records enable row level security;
revoke all on public.portal_memory_records from anon, authenticated;
create or replace function public.portal_memory_top_ten()
returns table(zone_id integer,player_id uuid,nickname text,team text,value bigint,created_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select 4,r.player_id,r.nickname,r.team,r.value,r.created_at from public.portal_memory_records r
 order by r.value asc,r.created_at,r.player_id limit 10;
$$;
revoke all on function public.portal_memory_top_ten() from public;
grant execute on function public.portal_memory_top_ten() to anon,authenticated;
create or replace function public.portal_submit_memory_record(p_zone integer,p_nickname text,p_team text,p_value bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Sign-in required'; end if;
 if p_zone<>4 or p_value<=0 or p_value>86400000 or p_team not in ('dragon','unicorn') or char_length(trim(p_nickname)) not between 1 and 20 then raise exception 'Invalid record'; end if;
 insert into public.portal_memory_records(player_id,nickname,team,value)
 values(auth.uid(),trim(p_nickname),p_team,p_value)
 on conflict(player_id) do update set nickname=excluded.nickname,team=excluded.team,value=excluded.value,created_at=now()
 where excluded.value<public.portal_memory_records.value;
end;
$$;
revoke all on function public.portal_submit_memory_record(integer,text,text,bigint) from public,anon;
grant execute on function public.portal_submit_memory_record(integer,text,text,bigint) to authenticated;
