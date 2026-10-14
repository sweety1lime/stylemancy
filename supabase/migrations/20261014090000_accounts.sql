-- Аккаунты «Стилемантии»: классы учителей, профили, прогресс студентов.
-- Студент видит только свои данные, учитель — данные студентов своих классов.

create extension if not exists pgcrypto with schema extensions;

-- ——— Таблицы ———

-- Класс (учебная группа). Код раздаётся студентам для регистрации.
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  -- Земли карты, которые учитель открыл классу
  open_lands text[] not null default array['floating-lands'],
  created_at timestamptz not null default now()
);

-- Профиль: учитель или студент. Создаётся автоматически при регистрации.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  nickname text not null check (char_length(nickname) between 2 and 24),
  class_id uuid references public.classes (id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((role = 'student') = (class_id is not null))
);

-- Ник уникален внутри класса (без учёта регистра)
create unique index profiles_class_nickname on public.profiles (class_id, lower(nickname)) where class_id is not null;

-- Прогресс по уровням
create table public.level_progress (
  student_id uuid not null references public.profiles (id) on delete cascade,
  level_id text not null check (char_length(level_id) <= 40),
  completed boolean not null default false,
  stars smallint not null default 0 check (stars between 0 and 3),
  attempts integer not null default 0 check (attempts >= 0),
  hints_used smallint not null default 0 check (hints_used >= 0),
  best_code text check (char_length(best_code) <= 20000),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, level_id)
);

-- Достижения, повторение и прочие счётчики — одним документом
create table public.student_stats (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 65536),
  updated_at timestamptz not null default now()
);

-- ——— Вспомогательная проверка (без рекурсии в правилах доступа) ———

-- Текущий пользователь — учитель класса, в котором учится student
create function public.is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles p
    join public.classes c on c.id = p.class_id
    where p.id = student and c.teacher_id = auth.uid()
  );
$$;

-- ——— Правила доступа (RLS) ———

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.level_progress enable row level security;
alter table public.student_stats enable row level security;

create policy "Учитель видит свои классы, студент — свой"
  on public.classes for select to authenticated
  using (
    teacher_id = (select auth.uid())
    or id = (select class_id from public.profiles where id = (select auth.uid()))
  );

create policy "Учитель меняет свои классы"
  on public.classes for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

create policy "Учитель удаляет свои классы"
  on public.classes for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "Свой профиль и профили своих студентов"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_teacher_of(id));

create policy "Свой профиль можно менять"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Менять можно только ник: роль и класс — нельзя
revoke update on public.profiles from authenticated, anon;
grant update (nickname) on public.profiles to authenticated;

create policy "Свой прогресс и прогресс своих студентов"
  on public.level_progress for select to authenticated
  using (student_id = (select auth.uid()) or public.is_teacher_of(student_id));

create policy "Свой прогресс можно записывать"
  on public.level_progress for insert to authenticated
  with check (student_id = (select auth.uid()));

create policy "Свой прогресс можно обновлять"
  on public.level_progress for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy "Своя статистика и статистика своих студентов"
  on public.student_stats for select to authenticated
  using (student_id = (select auth.uid()) or public.is_teacher_of(student_id));

create policy "Свою статистику можно записывать"
  on public.student_stats for insert to authenticated
  with check (student_id = (select auth.uid()));

create policy "Свою статистику можно обновлять"
  on public.student_stats for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- ——— Регистрация: профиль создаётся сам, код класса проверяется ———

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  target_class uuid;
begin
  if meta ->> 'role' = 'student' then
    select id into target_class from public.classes where code = upper(meta ->> 'class_code');
    if target_class is null then
      raise exception 'CLASS_NOT_FOUND';
    end if;
    insert into public.profiles (id, role, nickname, class_id)
    values (new.id, 'student', trim(meta ->> 'nickname'), target_class);
  else
    insert into public.profiles (id, role, nickname)
    values (
      new.id,
      'teacher',
      left(coalesce(nullif(trim(meta ->> 'nickname'), ''), split_part(new.email, '@', 1)), 24)
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ——— Функции для приложения ———

-- Название класса по коду: проверка кода до регистрации студента
create function public.class_name_by_code(class_code text) returns text
language sql stable security definer set search_path = '' as $$
  select name from public.classes where code = upper(class_code);
$$;

-- Учитель создаёт класс; код генерируется без похожих символов (0/O, 1/I)
create function public.create_class(class_name text) returns public.classes
language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code text;
  created public.classes;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher') then
    raise exception 'ONLY_TEACHERS';
  end if;
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    begin
      insert into public.classes (teacher_id, name, code)
      values (auth.uid(), trim(class_name), new_code)
      returning * into created;
      return created;
    exception when unique_violation then
      -- Такой код уже есть — пробуем другой
    end;
  end loop;
end;
$$;

-- Учитель сбрасывает пароль студенту своего класса
create function public.reset_student_password(student uuid, new_password text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_teacher_of(student) then
    raise exception 'NOT_YOUR_STUDENT';
  end if;
  if char_length(new_password) < 6 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;
  update auth.users
  set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')), updated_at = now()
  where id = student;
end;
$$;

-- Учитель удаляет студента из класса — вместе с аккаунтом и прогрессом
create function public.remove_student(student uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_teacher_of(student) then
    raise exception 'NOT_YOUR_STUDENT';
  end if;
  delete from auth.users where id = student;
end;
$$;

-- Удалить свой аккаунт со всеми данными
create function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;

-- Функции выполняют только вошедшие пользователи; код класса можно проверить и без входа
revoke execute on all functions in schema public from public, anon;
grant execute on function public.is_teacher_of(uuid) to authenticated;
grant execute on function public.create_class(text) to authenticated;
grant execute on function public.reset_student_password(uuid, text) to authenticated;
grant execute on function public.remove_student(uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.class_name_by_code(text) to anon, authenticated;
