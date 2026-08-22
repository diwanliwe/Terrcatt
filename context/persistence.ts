import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

/**
 * Local persistence — the source of truth for everything the participant does.
 * See docs/onboarding/CLAUDE.md → "Data storage & sync": offline-first, anonymous
 * UUID, full-snapshot sync later. This module only knows about the envelope;
 * the reducer state inside it is opaque here.
 */

const STORAGE_KEY = 'terrcatt/participant';

/** Bump when the persisted shape changes; add a migration in `load` for old versions. */
export const SCHEMA_VERSION = 1;

export interface Envelope<S> {
  schemaVersion: number;
  state: S;
}

export function createUserId(): string {
  return Crypto.randomUUID();
}

export async function load<S>(): Promise<S | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Envelope<S>;
    if (envelope.schemaVersion !== SCHEMA_VERSION) {
      // No migrations yet: an unknown version starts fresh rather than crash.
      return null;
    }
    return envelope.state;
  } catch {
    return null;
  }
}

export async function save<S>(state: S): Promise<void> {
  try {
    const envelope: Envelope<S> = { schemaVersion: SCHEMA_VERSION, state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Persistence failures must never surface to the player.
  }
}

export async function clear(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
