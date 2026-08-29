import { hasSupabaseConfig, supabaseClient } from './supabase';

export type RoutePoint = {
  lat: number;
  lng: number;
};

export type RouteCheckpoint = {
  name: string;
  lat: number;
  lng: number;
};

export type WariRouteRecord = {
  id: string;
  wari_id: string;
  source_lat?: number | null;
  source_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  route_points?: RoutePoint[] | null;
  checkpoints?: RouteCheckpoint[] | null;
  road_geometry?: unknown;
  total_distance_km?: number | null;
  estimated_duration_min?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SaveRouteInput = {
  wari_id: string;
  route_points: RoutePoint[];
  checkpoints: RouteCheckpoint[];
  source_lat?: number | null;
  source_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  road_geometry?: unknown;
  total_distance_km?: number | null;
  estimated_duration_min?: number | null;
};

export async function getRouteByWariId(wariId: string): Promise<WariRouteRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('wari_routes')
    .select('*')
    .eq('wari_id', wariId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariRouteRecord | null;
}

export async function saveRoute(input: SaveRouteInput): Promise<WariRouteRecord> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const upsertPayload = {
    wari_id: input.wari_id,
    source_lat: input.source_lat ?? null,
    source_lng: input.source_lng ?? null,
    destination_lat: input.destination_lat ?? null,
    destination_lng: input.destination_lng ?? null,
    route_points: input.route_points,
    checkpoints: input.checkpoints,
    road_geometry: input.road_geometry ?? null,
    total_distance_km: input.total_distance_km ?? null,
    estimated_duration_min: input.estimated_duration_min ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseClient
    .from('wari_routes')
    .upsert(upsertPayload, { onConflict: 'wari_id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as WariRouteRecord;
}

export async function updateRoute(wariId: string, updates: Partial<SaveRouteInput>): Promise<WariRouteRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('wari_routes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('wari_id', wariId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariRouteRecord | null;
}
