import { hasSupabaseConfig, supabaseClient } from './supabase';

export type ResourceRequestType = 'FOOD' | 'WATER';
export type ResourceRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';

export type ResourceRequest = {
  id: string;
  wari_id: string;
  halt_id?: string | null;
  resource_type: ResourceRequestType | string;
  quantity: number;
  unit: string;
  status: ResourceRequestStatus | string;
  requested_at?: string | null;
  fulfilled_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateResourceRequestInput = {
  wari_id: string;
  resource_type: ResourceRequestType | string;
  quantity: number;
  unit: string;
  halt_id?: string | null;
  status?: ResourceRequestStatus | string;
  notes?: string | null;
};

export async function listLiveResourceRequests(wariId?: string): Promise<ResourceRequest[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  let query = supabaseClient
    .from('resource_requests')
    .select('*')
    .in('status', ['PENDING', 'IN_PROGRESS'])
    .order('requested_at', { ascending: false });

  if (wariId) {
    query = query.eq('wari_id', wariId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ResourceRequest[];
}

export async function listResourceRequestHistory(wariId?: string): Promise<ResourceRequest[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  let query = supabaseClient
    .from('resource_requests')
    .select('*')
    .in('status', ['FULFILLED', 'CANCELLED'])
    .order('fulfilled_at', { ascending: false, nullsFirst: false });

  if (wariId) {
    query = query.eq('wari_id', wariId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ResourceRequest[];
}

export async function createResourceRequest(input: CreateResourceRequestInput): Promise<ResourceRequest> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .insert({
      wari_id: input.wari_id,
      halt_id: input.halt_id ?? null,
      resource_type: (input.resource_type ?? 'FOOD').toUpperCase(),
      quantity: Number(input.quantity) || 0,
      unit: input.unit ?? 'units',
      status: input.status ?? 'PENDING',
      notes: input.notes ?? null,
      requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ResourceRequest;
}

export async function updateResourceRequestStatus(
  requestId: string,
  status: ResourceRequestStatus,
  fulfilledAt?: string,
): Promise<ResourceRequest | null> {
  if (!supabaseClient || !hasSupabaseConfig || !requestId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .update({
      status,
      fulfilled_at: fulfilledAt ?? (status === 'FULFILLED' ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as ResourceRequest | null;
}
