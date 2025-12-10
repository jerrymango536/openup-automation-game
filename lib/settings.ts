import { supabase } from './supabase';

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// Cache settings in memory for performance
let settingsCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getAllSettings(): Promise<Setting[]> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key');

  if (error) throw error;
  return data || [];
}

export async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache.get(key) || null;
  }

  // Refresh cache
  await refreshSettingsCache();
  return settingsCache?.get(key) || null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  // Check cache first
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    const result: Record<string, string> = {};
    for (const key of keys) {
      const value = settingsCache.get(key);
      if (value) result[key] = value;
    }
    return result;
  }

  // Refresh cache
  await refreshSettingsCache();

  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = settingsCache?.get(key);
    if (value) result[key] = value;
  }
  return result;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) throw error;

  // Invalidate cache
  settingsCache = null;
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('settings')
      .update({ value: update.value, updated_at: update.updated_at })
      .eq('key', update.key);

    if (error) throw error;
  }

  // Invalidate cache
  settingsCache = null;
}

async function refreshSettingsCache(): Promise<void> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Failed to refresh settings cache:', error);
    return;
  }

  settingsCache = new Map();
  for (const row of data || []) {
    settingsCache.set(row.key, row.value);
  }
  cacheTimestamp = Date.now();
}

// Clear cache (useful for admin updates)
export function clearSettingsCache(): void {
  settingsCache = null;
}
