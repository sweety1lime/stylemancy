import { createClient } from '@supabase/supabase-js';
import { SESSION_STORAGE_KEY, SUPABASE_KEY, SUPABASE_URL } from './config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storageKey: SESSION_STORAGE_KEY, persistSession: true, autoRefreshToken: true },
});
