/**
 * Адрес и публичный ключ Supabase. Они и так видны в коде любого сайта,
 * поэтому хранятся здесь открыто: данные защищают правила доступа в самой базе.
 */
export const SUPABASE_URL = 'https://kecshdgmqumjetoawcja.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_NeKLjmmY5_EqX2u8mpQw8w_hPzqL33k';

/** Где supabase-js хранит сессию в браузере (имя по умолчанию: sb-<проект>-auth-token). */
export const SESSION_STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
