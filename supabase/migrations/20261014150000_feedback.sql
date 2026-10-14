-- Сообщения о проблемах: студент пишет прямо из уровня, учитель читает их в панели.
-- Студент видит только свои сообщения, учитель — сообщения студентов своих классов.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  level_id text not null check (char_length(level_id) <= 40),
  -- Что случилось: непонятное задание, верное решение не засчитано, что-то сломалось, другое
  kind text not null check (kind in ('unclear', 'not-accepted', 'bug', 'other')),
  message text not null default '' check (char_length(message) <= 1000),
  -- Код студента в момент сообщения — чтобы учитель видел, о чём речь
  code text check (char_length(code) <= 20000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index feedback_student_created on public.feedback (student_id, created_at desc);

-- ——— Правила доступа ———

revoke all on public.feedback from anon;
grant select, insert, delete on public.feedback to authenticated;
-- Учитель может только отметить сообщение решённым — текст не меняется
grant update (resolved) on public.feedback to authenticated;

alter table public.feedback enable row level security;

create policy "Свои сообщения и сообщения своих студентов"
  on public.feedback for select to authenticated
  using (student_id = (select auth.uid()) or public.is_teacher_of(student_id));

create policy "Студент пишет от своего имени"
  on public.feedback for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'student')
  );

create policy "Учитель отмечает сообщения своих студентов"
  on public.feedback for update to authenticated
  using (public.is_teacher_of(student_id))
  with check (public.is_teacher_of(student_id));

create policy "Учитель удаляет сообщения своих студентов"
  on public.feedback for delete to authenticated
  using (public.is_teacher_of(student_id));

-- ——— Защита от потока сообщений: не больше 10 в час от одного студента ———

create function public.limit_feedback() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (
    select count(*) from public.feedback
    where student_id = new.student_id and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'TOO_MANY_MESSAGES';
  end if;
  return new;
end;
$$;

create trigger feedback_rate_limit
  before insert on public.feedback
  for each row execute function public.limit_feedback();

revoke execute on function public.limit_feedback() from public, anon, authenticated;
