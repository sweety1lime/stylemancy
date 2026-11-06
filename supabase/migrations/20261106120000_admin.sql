-- Суперадмин: видит всех учителей, классы и студентов и управляет ими.
-- Админ — это учитель с дополнительными правами. Кто админ, записано в таблице admins: строки в неё
-- добавляет только владелец проекта в SQL Editor, из игры её не прочитать и не изменить.
-- Миграцию можно запускать повторно.
--
-- Как назначить админа (сначала зарегистрируйтесь в игре как учитель, потом выполните в SQL Editor):
--   insert into public.admins (user_id) select id from auth.users where email = 'ваша@почта';
-- Как снять права:
--   delete from public.admins where user_id = (select id from auth.users where email = 'ваша@почта');

-- ——— Кто админ ———

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Ни гостю, ни вошедшему доступа к таблице нет, и правил для неё нет намеренно: админов проверяет только is_admin()
revoke all on public.admins from anon, authenticated;

-- Текущий пользователь — админ
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ——— Админ — учитель всех студентов ———

-- Проверка «учитель этого студента» теперь пропускает и админа: на ней держатся правила доступа к профилям,
-- прогрессу, статистике и сообщениям студентов, а также сброс пароля и удаление студента
create or replace function public.is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1
    from public.profiles p
    join public.classes c on c.id = p.class_id
    where p.id = student and c.teacher_id = auth.uid()
  );
$$;

-- Классы читаются по teacher_id напрямую, поэтому админу нужны свои правила (имена короче 31 буквы: так Postgres их не обрезает)
drop policy if exists "Админ видит все классы" on public.classes;
create policy "Админ видит все классы"
  on public.classes for select to authenticated
  using (public.is_admin());

drop policy if exists "Админ меняет все классы" on public.classes;
create policy "Админ меняет все классы"
  on public.classes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ——— Функции админки ———

-- Всё одним запросом: учителя с почтой и числами, классы с числами, число открытых сообщений о проблемах
create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMINS';
  end if;
  return jsonb_build_object(
    'teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'nickname', p.nickname,
        'email', u.email,
        'created_at', p.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'is_admin', exists (select 1 from public.admins a where a.user_id = p.id),
        'classes', (select count(*) from public.classes c where c.teacher_id = p.id),
        'students', (select count(*) from public.profiles s join public.classes c on c.id = s.class_id where c.teacher_id = p.id)
      ) order by p.created_at desc)
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.role = 'teacher'
    ), '[]'::jsonb),
    'classes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'code', c.code,
        'open_lands', c.open_lands,
        'created_at', c.created_at,
        'teacher_id', c.teacher_id,
        'students', (select count(*) from public.profiles s where s.class_id = c.id),
        'levels_done', (
          select count(*) from public.level_progress lp
          join public.profiles s on s.id = lp.student_id
          where s.class_id = c.id and lp.completed
        ),
        'last_activity', (
          select max(lp.updated_at) from public.level_progress lp
          join public.profiles s on s.id = lp.student_id
          where s.class_id = c.id
        )
      ) order by c.created_at desc)
      from public.classes c
    ), '[]'::jsonb),
    'feedback_open', (select count(*) from public.feedback where not resolved)
  );
end;
$$;

-- Передать класс другому учителю: студенты и прогресс остаются, меняется только хозяин класса
create or replace function public.admin_move_class(target_class uuid, target_teacher uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMINS';
  end if;
  if not exists (select 1 from public.profiles where id = target_teacher and role = 'teacher') then
    raise exception 'NOT_A_TEACHER';
  end if;
  update public.classes set teacher_id = target_teacher where id = target_class;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;
end;
$$;

-- Удалить класс вместе с аккаунтами его студентов (профиль без класса не бывает, а аккаунты живут в auth.users)
create or replace function public.admin_delete_class(target_class uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMINS';
  end if;
  delete from auth.users where id in (select id from public.profiles where class_id = target_class);
  delete from public.classes where id = target_class;
  if not found then
    raise exception 'CLASS_NOT_FOUND';
  end if;
end;
$$;

-- Удалить аккаунт учителя или студента. У учителя вместе с аккаунтом уходят его классы и студенты этих классов.
-- Админа и себя удалить нельзя: сначала надо снять права в таблице admins
create or replace function public.admin_delete_user(target_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMINS';
  end if;
  if target_user = auth.uid() then
    raise exception 'CANNOT_DELETE_SELF';
  end if;
  if exists (select 1 from public.admins where user_id = target_user) then
    raise exception 'CANNOT_DELETE_ADMIN';
  end if;
  delete from auth.users where id in (
    select s.id from public.profiles s join public.classes c on c.id = s.class_id where c.teacher_id = target_user
  );
  delete from auth.users where id = target_user;
  if not found then
    raise exception 'USER_NOT_FOUND';
  end if;
end;
$$;

-- Сбросить пароль учителю или студенту. Пароль админа так не меняется
create or replace function public.admin_reset_password(target_user uuid, new_password text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMINS';
  end if;
  if char_length(new_password) < 6 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;
  if exists (select 1 from public.admins where user_id = target_user) then
    raise exception 'CANNOT_CHANGE_ADMIN';
  end if;
  if not exists (select 1 from public.profiles where id = target_user) then
    raise exception 'USER_NOT_FOUND';
  end if;
  update auth.users
  set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')), updated_at = now()
  where id = target_user;
end;
$$;

-- Функции выполняют только вошедшие пользователи; стать админом ни одна из них не позволяет
revoke execute on function
  public.is_admin(),
  public.admin_overview(),
  public.admin_move_class(uuid, uuid),
  public.admin_delete_class(uuid),
  public.admin_delete_user(uuid),
  public.admin_reset_password(uuid, text)
from public, anon;
grant execute on function
  public.is_admin(),
  public.admin_overview(),
  public.admin_move_class(uuid, uuid),
  public.admin_delete_class(uuid),
  public.admin_delete_user(uuid),
  public.admin_reset_password(uuid, text)
to authenticated;
