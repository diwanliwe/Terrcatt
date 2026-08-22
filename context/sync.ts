import { supabase } from '@/lib/supabase';
import { SCHEMA_VERSION } from './persistence';

/**
 * Push the participant's full local snapshot to the backend. Idempotent
 * (last write wins, keyed by userId), so retrying is always safe and there is
 * nothing to merge. Never throws: sync must never affect gameplay.
 * Returns true when the server acknowledged the write.
 */
export async function pushSnapshot(
  userId: string,
  deviceSecret: string,
  snapshot: unknown,
): Promise<boolean> {
  if (!supabase || !userId || !deviceSecret) return false;
  try {
    const { error } = await supabase.rpc('upsert_participant', {
      p_user_id: userId,
      p_secret: deviceSecret,
      p_schema_version: SCHEMA_VERSION,
      p_snapshot: snapshot,
    });
    return !error;
  } catch {
    return false;
  }
}

/** Erase the participant's server row (GDPR). Only the owning device can. */
export async function deleteSnapshot(userId: string, deviceSecret: string): Promise<boolean> {
  if (!supabase || !userId || !deviceSecret) return false;
  try {
    const { error } = await supabase.rpc('delete_participant', {
      p_user_id: userId,
      p_secret: deviceSecret,
    });
    return !error;
  } catch {
    return false;
  }
}
