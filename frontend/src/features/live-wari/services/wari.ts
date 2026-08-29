import { hasSupabaseConfig, supabaseClient } from './supabase';

export type WariStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type WariRecord = {
  id: string;
  wari_code: string | null;
  name: string | null;
  source: string | null;
  destination: string | null;
  start_date?: string | null;
  end_date?: string | null;
  organizer_name?: string | null;
  organizer_contact?: string | null;
  description?: string | null;
  status?: WariStatus | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateWariInput = {
  wari_code: string;
  name: string;
  source: string;
  destination: string;
  start_date?: string | null;
  end_date?: string | null;
  organizer_name?: string | null;
  organizer_contact?: string | null;
  description?: string | null;
  status?: WariStatus | string | null;
};

export async function listWaris(): Promise<WariRecord[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as WariRecord[];
}

export async function getWariById(wariId: string): Promise<WariRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('*')
    .eq('id', wariId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariRecord | null;
}

export async function getWariByCode(wariCode: string): Promise<WariRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !wariCode.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .select('*')
    .eq('wari_code', wariCode.trim())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariRecord | null;
}

export async function createWari(input: CreateWariInput): Promise<WariRecord> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .insert({
      wari_code: input.wari_code,
      name: input.name,
      source: input.source,
      destination: input.destination,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      organizer_name: input.organizer_name ?? null,
      organizer_contact: input.organizer_contact ?? null,
      description: input.description ?? null,
      status: input.status ?? 'PLANNED',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as WariRecord;
}

export async function updateWari(wariId: string, updates: Partial<CreateWariInput>): Promise<WariRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('waris')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wariId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as WariRecord | null;
}
