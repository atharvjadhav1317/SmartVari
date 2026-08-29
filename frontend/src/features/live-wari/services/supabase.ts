import { createClient } from '@supabase/supabase-js';

import type { WariSearchResult } from '../components/SearchResultsList';

export type WariRecord = {
  id: string;
  wari_code: string | null;
  name: string | null;
  source: string | null;
  destination: string | null;
  status: string | null;
  current_lat: number | null;
  current_lng: number | null;
  current_area: string | null;
  last_updated: string | null;
  created_at: string | null;
};

export type RoutePoint = {
  lat: number;
  lng: number;
};

export type RouteCheckpoint = {
  name: string;
  lat: number;
  lng: number;
};

export type SaveRouteInput = {
  wari_id: string;
  route_points: RoutePoint[];
  checkpoints: RouteCheckpoint[];
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error('Supabase client not initialized: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

const normalizeText = (value: string | null | undefined) => value?.trim() ?? '';

const logSupabaseError = (label: string, error: unknown) => {
  const errorObject = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  console.error(label, {
    message: errorObject?.message,
    details: errorObject?.details,
    hint: errorObject?.hint,
    code: errorObject?.code,
  });
};

const formatLastUpdated = (value: string | null | undefined) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const normalizeStatus = (value: string | null | undefined): WariSearchResult['status'] => {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized.includes('delay')) {
    return 'Delayed';
  }

  if (normalized.includes('stop')) {
    return 'Stopped';
  }

  if (normalized.includes('complete')) {
    return 'Completed';
  }

  return 'On Route';
};

export const mapWariToSearchResult = (record: WariRecord): WariSearchResult => ({
  wariId: normalizeText(record.wari_code) || record.id,
  wariName: normalizeText(record.name) || 'SmartVari Wari',
  source: normalizeText(record.source) || 'Unknown source',
  destination: normalizeText(record.destination) || 'Unknown destination',
  status: normalizeStatus(record.status),
  lastUpdated: formatLastUpdated(record.last_updated),
  currentArea: normalizeText(record.current_area) || 'Location unavailable',
  currentLat: record.current_lat ?? null,
  currentLng: record.current_lng ?? null,
});

export async function searchWarisById(wariId: string): Promise<WariRecord[]> {
  if (!supabaseClient) {
    const configError = new Error('Missing Supabase config');
    logSupabaseError('searchWarisById missing config', configError);
    return [];
  }

  const query = normalizeText(wariId);

  if (!query) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('*')
    .ilike('wari_code', query);

  if (error) {
    logSupabaseError('searchWarisById failed', error);
    throw error;
  }

  return (data ?? []) as WariRecord[];
}

export async function searchWarisByRoute(source: string, destination: string): Promise<WariRecord[]> {
  if (!supabaseClient) {
    const configError = new Error('Missing Supabase config');
    logSupabaseError('searchWarisByRoute missing config', configError);
    return [];
  }

  const sourceQuery = normalizeText(source);
  const destinationQuery = normalizeText(destination);

  if (!sourceQuery || !destinationQuery) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('*')
    .ilike('source', `%${sourceQuery}%`)
    .ilike('destination', `%${destinationQuery}%`);

  if (error) {
    logSupabaseError('searchWarisByRoute failed', error);
    throw error;
  }

  return (data ?? []) as WariRecord[];
}

export async function getWariIdByCode(wariCode: string): Promise<WariRecord | null> {
  if (!supabaseClient) {
    const configError = new Error('Missing Supabase config');
    logSupabaseError('getWariIdByCode missing config', configError);
    return null;
  }

  const normalizedCode = normalizeText(wariCode);

  if (!normalizedCode) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('id, wari_code, name, source, destination')
    .eq('wari_code', normalizedCode)
    .maybeSingle();

  if (error) {
    logSupabaseError('getWariIdByCode failed', error);
    throw error;
  }

  return (data ?? null) as WariRecord | null;
}

export async function saveRoute(input: SaveRouteInput): Promise<void> {
  if (!supabaseClient) {
    const configError = new Error('Missing Supabase config');
    logSupabaseError('saveRoute missing config', configError);
    throw configError;
  }

  const { data, error } = await supabaseClient
    .from('wari_routes')
    .insert({
      wari_id: input.wari_id,
      route_points: input.route_points,
      checkpoints: input.checkpoints,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    logSupabaseError('saveRoute failed', error);
    throw error;
  }

  if (!data) {
    const routeError = new Error('Route save returned no data');
    logSupabaseError('saveRoute returned no data', routeError);
    throw routeError;
  }
}

export async function createWari(input: {
  wari_code: string;
  name: string;
  source: string;
  destination: string;
}): Promise<WariRecord> {
  if (!supabaseClient) {
    const configError = new Error('Missing Supabase config');
    logSupabaseError('createWari missing config', configError);
    throw configError;
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .insert({
      wari_code: input.wari_code,
      name: input.name,
      source: input.source,
      destination: input.destination,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('createWari failed', error);
    throw error;
  }

  return data as WariRecord;
}
