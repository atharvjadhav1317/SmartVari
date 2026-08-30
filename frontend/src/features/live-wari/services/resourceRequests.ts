import { hasSupabaseConfig, supabaseClient } from './supabase';

export type ResourceRequestType = 'FOOD' | 'WATER';
export type ResourceRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';
type ResourceProvider = { id?: string | null; name?: string | null };

export type ResourceRequest = {
  id: string;
  wari_id: string;
  halt_id?: string | null;
  request_latitude?: number | null;
  request_longitude?: number | null;
  required_date?: string | null;
  required_time?: string | null;
  resource_type: ResourceRequestType | string;
  quantity: number;
  unit: string;
  status: ResourceRequestStatus | string;
  requested_at?: string | null;
  fulfilled_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  service_provider_id?: string | null;
  delivery_status?: string | null;
  accepted_at?: string | null;
  delivered_at?: string | null;
  request_provider?: ResourceProvider[] | null;
  service_providers?: ResourceProvider | ResourceProvider[] | null;
};

export type CreateResourceRequestInput = {
  wari_id: string;
  resource_type: ResourceRequestType | string;
  quantity: number;
  unit: string;
  halt_id?: string | null;
  request_latitude?: number | null;
  request_longitude?: number | null;
  required_date?: string | null;
  required_time?: string | null;
  status?: ResourceRequestStatus | string;
  notes?: string | null;
};

export async function listLiveResourceRequests(wariId?: string): Promise<ResourceRequest[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  let query = supabaseClient
    .from('resource_requests')
    .select('*, waris(id, wari_code, name, source, destination), service_providers!resource_requests_service_provider_fkey(id, name)')
    .in('delivery_status', ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'ARRIVED'])
    .order('requested_at', { ascending: false });

  if (wariId) {
    query = query.eq('wari_id', wariId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((request) => ({ ...request, request_provider: Array.isArray(request.service_providers) ? request.service_providers : request.service_providers ? [request.service_providers] : [] })) as ResourceRequest[];
}

export async function listResourceRequestHistory(wariId?: string): Promise<ResourceRequest[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  let query = supabaseClient
    .from('resource_requests')
    .select('*, waris(id, wari_code, name, source, destination), service_providers!resource_requests_service_provider_fkey(id, name)')
    .in('delivery_status', ['DELIVERED', 'CANCELLED'])
    .order('fulfilled_at', { ascending: false, nullsFirst: false });

  if (wariId) {
    query = query.eq('wari_id', wariId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((request) => ({ ...request, request_provider: Array.isArray(request.service_providers) ? request.service_providers : request.service_providers ? [request.service_providers] : [] })) as ResourceRequest[];
}

export function subscribeToResourceRequestChanges(
  wariId: string,
  onChange: () => void,
  onStatus?: (status: string) => void,
) {
  if (!supabaseClient || !hasSupabaseConfig || !wariId.trim()) return null;

  const channel = supabaseClient
    .channel(`resource-requests-${wariId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_requests', filter: `wari_id=eq.${wariId}` }, onChange)
    .subscribe((status) => onStatus?.(status));

  return () => {
    void supabaseClient?.removeChannel(channel);
  };
}

export async function createResourceRequest(input: CreateResourceRequestInput): Promise<ResourceRequest> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const { data, error } = await supabaseClient.rpc('create_resource_request_with_nearest_provider', {
    p_wari_id: input.wari_id,
    p_halt_id: input.halt_id ?? null,
    p_request_latitude: input.request_latitude ?? null,
    p_request_longitude: input.request_longitude ?? null,
    p_required_date: input.required_date ?? null,
    p_required_time: input.required_time ?? null,
    p_resource_type: (input.resource_type ?? 'FOOD').toUpperCase(),
    p_quantity: Number(input.quantity) || 0,
    p_unit: input.unit ?? 'units',
    p_notes: input.notes ?? null,
    p_status: input.status ?? 'PENDING',
  });

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
