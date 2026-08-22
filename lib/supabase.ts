import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Null when the env vars are missing (local dev without a backend): the app
 * then runs fully offline and sync is a silent no-op.
 * No Supabase auth is used — identity is the local anonymous UUID — so no
 * session storage is configured.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
