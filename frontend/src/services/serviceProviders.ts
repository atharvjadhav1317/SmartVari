import { hasSupabaseConfig, supabaseClient } from '../features/live-wari/services/supabase';

export type ServiceProvider = {
  id: string;
  name: string;
  phone?: string | null;
  service_type?: string | null;
  availability?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  food_capacity?: number | null;
  water_capacity?: number | null;
  location_updated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ServiceRequestAssignmentStatus =
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ServiceRequestRecord = {
  id: string;
  wari_id?: string | null;
  halt_id?: string | null;
  request_latitude?: number | null;
  request_longitude?: number | null;
  required_date?: string | null;
  required_time?: string | null;
  resource_type?: string | null;
  quantity?: number | null;
  unit?: string | null;
  status?: string | null;
  service_provider_id?: string | null;
  accepted_at?: string | null;
  delivery_status?: string | null;
  delivery_started_at?: string | null;
  arrived_at?: string | null;
  delivered_at?: string | null;
  fulfilled_at?: string | null;
  requested_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  waris?: {
    id?: string | null;
    wari_code?: string | null;
    name?: string | null;
    source?: string | null;
    destination?: string | null;
  }[] | null;
  wari_halts?: {
    id?: string | null;
    halt_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }[] | null;
};

const normalizeAvailability = (value: string | boolean | null | undefined): 'AVAILABLE' | 'BUSY' | 'OFFLINE' => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper === 'BUSY' || upper === 'OFFLINE') {
      return upper as 'BUSY' | 'OFFLINE';
    }
  }
  return 'AVAILABLE';
};

const normalizeServiceType = (value: string | null | undefined): string => {
  if (!value) return 'VOLUNTEER';
  const normalized: Record<string, string> = {
    VOLUNTEER: 'VOLUNTEER',
    FOOD: 'FOOD',
    'FOOD SUPPORT': 'FOOD',
    'Food support': 'FOOD',
    WATER: 'WATER',
    'WATER SUPPORT': 'WATER',
    'Water support': 'WATER',
    MEDICAL: 'MEDICAL',
    'MEDICAL SUPPORT': 'MEDICAL',
    'Medical support': 'MEDICAL',
    BOTH: 'BOTH',
    'FOOD + WATER': 'BOTH',
    'Food + Water': 'BOTH',
  };
  return normalized[value] || 'VOLUNTEER';
};

const logServiceProviderError = (label: string, error: unknown) => {
  const details = error as { message?: string; details?: string; hint?: string; code?: string };
  console.error(label, {
    message: details?.message,
    details: details?.details,
    hint: details?.hint,
    code: details?.code,
  });
};

export async function listServiceProviders(): Promise<ServiceProvider[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  const { data, error } = await supabaseClient.from('service_providers').select('*').order('created_at', { ascending: false });

  if (error) {
    logServiceProviderError('listServiceProviders failed', error);
    throw error;
  }

  return (data ?? []) as ServiceProvider[];
}

export async function createServiceProvider(input: {
  name: string;
  phone?: string | null;
  service_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  availability?: string | boolean | null;
  food_capacity?: number | null;
  water_capacity?: number | null;
}): Promise<ServiceProvider> {
  if (!supabaseClient || !hasSupabaseConfig) {
    throw new Error('Missing Supabase config');
  }

  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const foodCapacity = Number(input.food_capacity ?? 0);
  const waterCapacity = Number(input.water_capacity ?? 0);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('A valid latitude and longitude are required');
  }
  if (!Number.isFinite(foodCapacity) || foodCapacity < 0 || !Number.isFinite(waterCapacity) || waterCapacity < 0) {
    throw new Error('Food and water capacities must be valid non-negative numbers');
  }

  const { data, error } = await supabaseClient
    .from('service_providers')
    .insert({
      name: input.name.trim(),
      phone: input.phone ?? null,
      service_type: normalizeServiceType(input.service_type),
      availability: normalizeAvailability(input.availability),
      latitude,
      longitude,
      food_capacity: foodCapacity,
      water_capacity: waterCapacity,
    })
    .select()
    .single();

  if (error) {
    logServiceProviderError('createServiceProvider failed', error);
    throw error;
  }

  return data as ServiceProvider;
}

export async function updateServiceProviderLocation(
  providerId: string,
  latitude: number,
  longitude: number,
): Promise<ServiceProvider | null> {
  if (!supabaseClient || !hasSupabaseConfig || !providerId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('service_providers')
    .update({
      latitude,
      longitude,
      location_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)
    .select()
    .single();

  if (error) {
    logServiceProviderError('updateServiceProviderLocation failed', error);
    throw error;
  }

  return (data ?? null) as ServiceProvider | null;
}

export async function updateServiceProviderAvailability(
  providerId: string,
  availability: string | boolean,
): Promise<ServiceProvider | null> {
  if (!supabaseClient || !hasSupabaseConfig || !providerId.trim()) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('service_providers')
    .update({
      availability: normalizeAvailability(availability),
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)
    .select()
    .single();

  if (error) {
    logServiceProviderError('updateServiceProviderAvailability failed', error);
    throw error;
  }

  return (data ?? null) as ServiceProvider | null;
}

export async function listAvailableResourceRequests(providerId?: string): Promise<ServiceRequestRecord[]> {
  if (!supabaseClient || !hasSupabaseConfig) {
    return [];
  }

  let query = supabaseClient
    .from('resource_requests')
    .select('*, waris(id, wari_code, name, source, destination), wari_halts(id, halt_name, latitude, longitude)')
    .eq('status', 'PENDING')
    .eq('delivery_status', 'PENDING')
    .order('requested_at', { ascending: false });

  if (providerId) {
    query = query.eq('service_provider_id', providerId);
  } else {
    query = query.is('service_provider_id', null);
  }

  const { data, error } = await query;

  if (error) {
    logServiceProviderError('listAvailableResourceRequests failed', error);
    throw error;
  }

  return (data ?? []) as ServiceRequestRecord[];
}

export async function acceptResourceRequest(
  requestId: string,
  providerId: string,
): Promise<ServiceRequestRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !providerId.trim() || !requestId.trim()) {
    return null;
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .update({
      service_provider_id: providerId,
      accepted_at: now,
      delivery_status: 'ACCEPTED',
    })
    .eq('id', requestId)
    .or(`service_provider_id.is.null,service_provider_id.eq.${providerId}`)
    .select()
    .single();

  if (error) {
    logServiceProviderError('acceptResourceRequest failed', error);
    throw error;
  }

  return (data ?? null) as ServiceRequestRecord | null;
}

export async function updateDeliveryStatus(
  requestId: string,
  deliveryStatus: ServiceRequestAssignmentStatus,
): Promise<ServiceRequestRecord | null> {
  if (!supabaseClient || !hasSupabaseConfig || !requestId.trim()) {
    return null;
  }

  const now = new Date().toISOString();
  const statusPayload: Record<string, string | null> =
    deliveryStatus === 'DELIVERED'
      ? {
          delivery_status: 'DELIVERED',
          delivered_at: now,
          status: 'FULFILLED',
          fulfilled_at: now,
        }
      : { delivery_status: deliveryStatus };

  if (deliveryStatus === 'CANCELLED') {
    statusPayload.delivered_at = null;
    statusPayload.status = 'CANCELLED';
  }

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .update(statusPayload)
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('UPDATE DELIVERY ERROR', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
    logServiceProviderError('updateDeliveryStatus failed', error);
    throw error;
  }

  return (data ?? null) as ServiceRequestRecord | null;
}

export async function getMyActiveDeliveries(providerId: string): Promise<ServiceRequestRecord[]> {
  if (!supabaseClient || !hasSupabaseConfig || !providerId.trim()) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .select('*, waris(id, wari_code, name, source, destination), wari_halts(id, halt_name, latitude, longitude)')
    .eq('service_provider_id', providerId)
    .in('delivery_status', ['ACCEPTED', 'IN_TRANSIT', 'ARRIVED'])
    .order('accepted_at', { ascending: false });

  if (error) {
    logServiceProviderError('getMyActiveDeliveries failed', error);
    throw error;
  }

  return (data ?? []) as ServiceRequestRecord[];
}

export async function getMyDeliveryHistory(providerId: string): Promise<ServiceRequestRecord[]> {
  if (!supabaseClient || !hasSupabaseConfig || !providerId.trim()) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('resource_requests')
    .select('*, waris(id, wari_code, name, source, destination), wari_halts(id, halt_name, latitude, longitude)')
    .eq('service_provider_id', providerId)
    .in('delivery_status', ['DELIVERED', 'CANCELLED'])
    .order('delivered_at', { ascending: false, nullsFirst: false });

  if (error) {
    logServiceProviderError('getMyDeliveryHistory failed', error);
    throw error;
  }

  return (data ?? []) as ServiceRequestRecord[];
}
