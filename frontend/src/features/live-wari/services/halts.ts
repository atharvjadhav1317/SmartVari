import { hasSupabaseConfig, supabaseClient } from './supabase';

export type HaltType =
  | 'START'
  | 'REST'
  | 'FOOD'
  | 'WATER'
  | 'MEDICAL'
  | 'LUNCH'
  | 'NIGHT'
  | 'DESTINATION'
  | 'OTHER';

export type WariHalt = {
  id: string;
  wari_id: string;
  day_number: number;
  sequence_order: number;
  halt_name: string;
  latitude: number;
  longitude: number;
  halt_type: HaltType | string;
  arrival_time?: string | null;
  departure_time?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateHaltInput = {
  wari_id: string;
  day_number: number;
  sequence_order: number;
  halt_name: string;
  latitude: number;
  longitude: number;
  halt_type?: HaltType | string;
  arrival_time?: string | null;
  departure_time?: string | null;
  notes?: string | null;
};

export async function getWariHalts(wariId: string): Promise<WariHalt[]> {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('wari_halts')
    .select('*')
    .eq('wari_id', wariId)
    .order('day_number', { ascending: true })
    .order('sequence_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as WariHalt[];
}

export async function createWariHalts(halts: CreateHaltInput[]): Promise<WariHalt[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const { data, error } = await supabaseClient
    .from('wari_halts')
    .insert(
      halts.map((halt) => ({
        ...halt,
        halt_type: halt.halt_type ?? 'OTHER',
        updated_at: new Date().toISOString(),
      })),
    )
    .select();

  if (error) {
    throw error;
  }

  return (data ?? []) as WariHalt[];
}

export async function upsertHalt(halt: CreateHaltInput): Promise<WariHalt | null> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const { data, error } = await supabaseClient
    .from('wari_halts')
    .upsert({
      ...halt,
      halt_type: halt.halt_type ?? 'OTHER',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariHalt | null;
}
