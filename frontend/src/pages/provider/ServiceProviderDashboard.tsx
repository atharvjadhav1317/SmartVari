import { useEffect, useMemo, useState } from 'react';

import {
  acceptResourceRequest,
  createServiceProvider,
  getMyActiveDeliveries,
  getMyDeliveryHistory,
  listAvailableResourceRequests,
  listServiceProviders,
  updateDeliveryStatus,
  updateServiceProviderAvailability,
  updateServiceProviderLocation,
  type ServiceProvider,
  type ServiceRequestRecord,
} from '../../services/serviceProviders';

import './ServiceProviderDashboard.css';

const initialProfile = {
  name: 'SmartVari Volunteer',
  phone: '',
  serviceType: 'VOLUNTEER',
};

const formatResourceType = (resourceType?: string | null) => {
  if (!resourceType) {
    return 'Support';
  }

  return resourceType === 'WATER' ? 'Water' : 'Food';
};

const formatStatus = (status?: string | null) => {
  switch (status) {
    case 'ACCEPTED':
      return 'Accepted';
    case 'IN_TRANSIT':
      return 'In transit';
    case 'ARRIVED':
      return 'Arrived';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

const badgeClass = (status?: string | null) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'ARRIVED':
    case 'IN_TRANSIT':
    case 'ACCEPTED':
      return 'warning';
    default:
      return 'warning';
  }
};

const formatRequiredDate = (value?: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Date not set');
const formatRequiredTime = (value?: string | null) => (value ? new Date(`1970-01-01T${value}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Time not set');

const deliveryStages = ['ACCEPTED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED'];

export function ServiceProviderDashboard() {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [providerId, setProviderId] = useState('');
  const [online, setOnline] = useState(true);
  const [requests, setRequests] = useState<ServiceRequestRecord[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ServiceRequestRecord[]>([]);
  const [history, setHistory] = useState<ServiceRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [registrationForm, setRegistrationForm] = useState(initialProfile);

  const stats = useMemo(
    () => ({
      liveRequests: requests.length,
      activeDeliveries: activeDeliveries.length,
      completed: history.length,
      avgResponse: '7 min',
    }),
    [requests, activeDeliveries, history],
  );

  const loadAll = async () => {
    try {
      const providers = await listServiceProviders();
      if (!providers.length) {
        setProvider(null);
        setProviderId('');
        setOnline(true);
        setRequests([]);
        setActiveDeliveries([]);
        setHistory([]);
        return;
      }

      const nextProvider = providers[0];
      setProvider(nextProvider);
      setProviderId(nextProvider.id || '');
      setOnline(nextProvider.availability === 'AVAILABLE');

      const [nextRequests, nextActiveDeliveries, nextHistory] = await Promise.all([
        listAvailableResourceRequests(),
        getMyActiveDeliveries(nextProvider.id),
        getMyDeliveryHistory(nextProvider.id),
      ]);

      setRequests(nextRequests || []);
      setActiveDeliveries(nextActiveDeliveries || []);
      setHistory(nextHistory || []);
    } catch (error) {
      console.error('Unable to load service provider dashboard', error);
      setNotice('Unable to load live volunteer data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registrationForm.name.trim()) {
      setNotice('Volunteer name is required.');
      return;
    }

    try {
      const created = await createServiceProvider({
        name: registrationForm.name,
        phone: registrationForm.phone || null,
        service_type: registrationForm.serviceType || 'VOLUNTEER',
        availability: 'AVAILABLE',
      });

      setProvider(created);
      setProviderId(created.id || '');
      setOnline(true);
      setRegistrationForm(initialProfile);
      setNotice('Volunteer profile created.');
      await loadAll();
    } catch (error) {
      console.error('Unable to create volunteer profile', error);
      setNotice('Unable to create volunteer profile.');
    }
  };

  const handleToggleAvailability = async () => {
    if (!providerId) {
      return;
    }

    const nextStatus = online ? 'OFFLINE' : 'AVAILABLE';

    try {
      await updateServiceProviderAvailability(providerId, nextStatus);
      setOnline(!online);
      setProvider((current) => (current ? { ...current, availability: nextStatus } : current));
      setNotice(nextStatus === 'AVAILABLE' ? 'Volunteer is now available.' : 'Volunteer is now offline.');
    } catch (error) {
      console.error('Unable to update availability', error);
      setNotice('Unable to update availability.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!providerId) {
      return;
    }

    try {
      await acceptResourceRequest(requestId, providerId);
      setNotice('Request accepted and assigned to you.');
      await loadAll();
    } catch (error) {
      console.error('Unable to accept request', error);
      setNotice('Unable to accept this request.');
    }
  };

  const handleAdvanceDelivery = async (requestId: string, currentStatus?: string | null) => {
    const nextStatus =
      currentStatus === 'ARRIVED'
        ? 'DELIVERED'
        : currentStatus === 'IN_TRANSIT'
          ? 'ARRIVED'
          : currentStatus === 'ACCEPTED'
            ? 'IN_TRANSIT'
            : 'IN_TRANSIT';

    try {
      console.log('Updating request', { requestId, nextStatus });
      await updateDeliveryStatus(requestId, nextStatus as 'ACCEPTED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED');
      setNotice(`Delivery status updated to ${formatStatus(nextStatus)}.`);
      await loadAll();
    } catch (error) {
      console.error('Unable to update delivery status', error);
      setNotice('Unable to update delivery status.');
    }
  };

  const handleUpdateLocation = () => {
    if (!providerId || !navigator.geolocation) {
      setNotice('Location is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const updated = await updateServiceProviderLocation(providerId, coords.latitude, coords.longitude);
          if (updated) setProvider(updated);
          setNotice('Volunteer location updated.');
        } catch (error) {
          console.error('Unable to update volunteer location', error);
          setNotice('Unable to update volunteer location.');
        }
      },
      (error) => {
        console.error('Unable to read volunteer location', error);
        setNotice('Please allow location access to update your position.');
      },
    );
  };

  return (
    <div className="smartvari-provider-shell">
      <header className="smartvari-provider-header">
        <div className="smartvari-provider-header-row">
          <div className="smartvari-provider-title">
            <div className="smartvari-provider-badge">SV</div>
            <div>
              <h1>Service Provider Dashboard</h1>
              <p className="smartvari-provider-subtitle">
                Volunteer operations for live Wari support and delivery coordination.
              </p>
            </div>
          </div>

          <div className="smartvari-provider-actions">
            <button className="smartvari-secondary-btn" type="button" onClick={() => void loadAll()}>
              Refresh feed
            </button>
            <button className="smartvari-primary-btn" type="button" onClick={() => setNotice('Use the registration form in the volunteer status panel.') }>
              Register volunteer
            </button>
          </div>
        </div>
      </header>

      <div className="smartvari-provider-content">
        <aside className="smartvari-panel">
          <div className="smartvari-panel-header">
            <h2>Volunteer status</h2>
            <span className={`smartvari-status-pill ${online ? 'available' : 'unavailable'}`}>
              {online ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div className="smartvari-panel-body">
            {provider ? (
              <>
                <div className="smartvari-provider-card">
                  <div className="smartvari-provider-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="smartvari-provider-avatar">
                        {provider.name?.slice(0, 2).toUpperCase() || 'SV'}
                      </div>
                      <div className="smartvari-provider-details">
                        <strong>{provider.name}</strong>
                        <span>{provider.service_type || 'Volunteer'}</span>
                        <small>{provider.phone || 'No phone added yet'}</small>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle status"
                      className={`smartvari-toggle ${provider.availability === 'AVAILABLE' ? 'on' : ''}`}
                      onClick={handleToggleAvailability}
                    />
                    <button className="smartvari-muted-btn" type="button" onClick={handleUpdateLocation}>
                      Update location
                    </button>
                  </div>

                  <div className="smartvari-stat-grid">
                    <div className="smartvari-stat-card">
                      <span>Status</span>
                      <strong>{provider.availability === 'AVAILABLE' ? 'Available' : provider.availability === 'BUSY' ? 'Busy' : 'Offline'}</strong>
                    </div>
                    <div className="smartvari-stat-card">
                      <span>Open requests</span>
                      <strong>{stats.liveRequests}</strong>
                    </div>
                    <div className="smartvari-stat-card">
                      <span>Active delivery</span>
                      <strong>{stats.activeDeliveries}</strong>
                    </div>
                    <div className="smartvari-stat-card">
                      <span>Completed</span>
                      <strong>{stats.completed}</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form className="smartvari-form" onSubmit={handleRegister}>
                <div className="smartvari-form-row">
                  <label className="smartvari-form-field">
                    Volunteer name
                    <input
                      value={registrationForm.name}
                      onChange={(event) =>
                        setRegistrationForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Seva Foundation volunteer"
                    />
                  </label>

                  <label className="smartvari-form-field">
                    Phone
                    <input
                      value={registrationForm.phone}
                      onChange={(event) =>
                        setRegistrationForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="+91 98765 43210"
                    />
                  </label>

                  <label className="smartvari-form-field">
                    Service type
                    <select
                      value={registrationForm.serviceType}
                      onChange={(event) =>
                        setRegistrationForm((current) => ({ ...current, serviceType: event.target.value }))
                      }
                    >
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="FOOD">Food support</option>
                      <option value="WATER">Water support</option>
                      <option value="BOTH">Food + Water</option>
                      <option value="MEDICAL">Medical support</option>
                    </select>
                  </label>
                </div>

                <button className="smartvari-primary-btn" type="submit">
                  Register volunteer
                </button>
              </form>
            )}

            {notice && <div className="smartvari-inline-message">{notice}</div>}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 20 }}>
          <section className="smartvari-panel">
            <div className="smartvari-panel-header">
              <h2>Live requests</h2>
              <span className="smartvari-micro-label">{requests.length} open</span>
            </div>

            <div className="smartvari-panel-body">
              {!requests.length ? (
                <div className="smartvari-empty-state">
                  <h3>No live requests</h3>
                  <p>There are no active requests in the system yet.</p>
                  <button className="smartvari-primary-btn" type="button" style={{ marginTop: 8 }}>
                    Register Wari
                  </button>
                </div>
              ) : (
                <div className="smartvari-request-list">
                  {requests.map((request) => (
                    <div className="smartvari-request-item" key={request.id}>
                      <div className="smartvari-request-item-top">
                        <div>
                          <strong>
                            {request.waris?.[0]?.name || request.waris?.[0]?.wari_code || 'Wari request'}
                          </strong>
                          <small>
                            {request.waris?.[0]?.source || 'Unknown source'} →{' '}
                            {request.waris?.[0]?.destination || 'Unknown destination'}
                          </small>
                        </div>
                        <span className={`smartvari-tag ${badgeClass(request.delivery_status || request.status)}`}>
                          {formatStatus(request.delivery_status || request.status)}
                        </span>
                      </div>

                      <div className="smartvari-request-tags">
                        <span className="smartvari-tag">
                          {formatResourceType(request.resource_type)} · {request.quantity ?? 0} {request.unit || 'units'}
                        </span>
                        <span className="smartvari-tag warning">📍 {request.wari_halts?.[0]?.halt_name || (request.request_latitude != null && request.request_longitude != null ? `${request.request_latitude}, ${request.request_longitude}` : 'Location not set')}</span>
                        <span className="smartvari-tag">📅 {formatRequiredDate(request.required_date)} · 🕐 {formatRequiredTime(request.required_time)}</span>
                      </div>
                      {request.notes && <small className="smartvari-request-note">{request.notes}</small>}

                      <div className="smartvari-request-actions">
                        <button type="button" className="smartvari-danger-btn">
                          Decline
                        </button>
                        <button
                          type="button"
                          className="smartvari-accept-btn"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="smartvari-panel">
            <div className="smartvari-panel-header">
              <h2>Active delivery</h2>
              <span className="smartvari-micro-label">{activeDeliveries.length} in progress</span>
            </div>

            <div className="smartvari-panel-body">
              {!activeDeliveries.length ? (
                <div className="smartvari-empty-state">
                  <h3>No active delivery</h3>
                  <p>Accept a live request to start a delivery run.</p>
                </div>
              ) : (
                <div className="smartvari-delivery-list">
                  {activeDeliveries.map((delivery) => (
                    <div className="smartvari-delivery-item" key={delivery.id}>
                      <div className="smartvari-delivery-item-top">
                        <div>
                          <strong>
                            {delivery.waris?.[0]?.name || delivery.waris?.[0]?.wari_code || 'Wari delivery'}
                          </strong>
                          <small>
                            {delivery.waris?.[0]?.source || 'Unknown source'} →{' '}
                            {delivery.waris?.[0]?.destination || 'Unknown destination'}
                          </small>
                        </div>
                        <span className={`smartvari-tag ${badgeClass(delivery.delivery_status || delivery.status)}`}>
                          {formatStatus(delivery.delivery_status || delivery.status)}
                        </span>
                      </div>

                      <div className="smartvari-delivery-meta">
                        <span className="smartvari-tag">
                          {formatResourceType(delivery.resource_type)} · {delivery.quantity ?? 0} {delivery.unit || 'units'}
                        </span>
                        <span className="smartvari-tag success">{delivery.accepted_at ? 'Assigned' : 'New'}</span>
                      </div>

                      <div className="smartvari-progress" aria-label={`Delivery status: ${formatStatus(delivery.delivery_status)}`}>
                        {deliveryStages.map((stage, index) => {
                          const currentIndex = deliveryStages.indexOf(delivery.delivery_status || 'ACCEPTED');
                          const complete = index < currentIndex;
                          const current = index === currentIndex;
                          return (
                            <div className={`smartvari-progress-step ${complete ? 'complete' : ''} ${current ? 'current' : ''}`} key={stage}>
                              <span className="smartvari-progress-marker">{complete ? '✓' : current ? '●' : '○'}</span>
                              <span>{stage === 'IN_TRANSIT' ? 'ON THE WAY' : stage}</span>
                              {index < deliveryStages.length - 1 && <i />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="smartvari-delivery-actions">
                        <button
                          type="button"
                          className="smartvari-accept-btn"
                          onClick={() => handleAdvanceDelivery(delivery.id, delivery.delivery_status || delivery.status)}
                        >
                          {delivery.delivery_status === 'ACCEPTED' ? 'Start delivery' : delivery.delivery_status === 'IN_TRANSIT' ? 'Mark arrived' : 'Mark delivered'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="smartvari-panel">
            <div className="smartvari-panel-header">
              <h2>Delivery history</h2>
              <span className="smartvari-micro-label">{history.length} completed</span>
            </div>

            <div className="smartvari-panel-body">
              {!history.length ? (
                <div className="smartvari-empty-state">
                  <h3>No delivery history</h3>
                  <p>Completed support runs will appear here.</p>
                </div>
              ) : (
                <div className="smartvari-history-list">
                  {history.map((item) => (
                    <div className="smartvari-history-item" key={item.id}>
                      <strong>
                        {item.waris?.[0]?.name || item.waris?.[0]?.wari_code || 'Wari route'}
                      </strong>
                      <small>
                        {formatResourceType(item.resource_type)} · {item.quantity ?? 0} {item.unit || 'units'}
                      </small>
                      <div className="smartvari-request-actions" style={{ justifyContent: 'flex-start' }}>
                        <span className={`smartvari-tag ${badgeClass(item.delivery_status || item.status)}`}>
                          {formatStatus(item.delivery_status || item.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {loading && <div className="smartvari-inline-message">Loading volunteer operations…</div>}
    </div>
  );
}
