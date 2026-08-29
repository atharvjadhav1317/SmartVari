import React, { useEffect, useMemo, useState } from 'react';

import { listWaris, createWari } from '../../features/live-wari/services/wari';
import { getRouteByWariId, saveRoute } from '../../features/live-wari/services/routes';
import { getWariHalts, createWariHalts } from '../../features/live-wari/services/halts';
import {
  createResourceRequest,
  listLiveResourceRequests,
  listResourceRequestHistory,
  updateResourceRequestStatus,
} from '../../features/live-wari/services/resourceRequests';
import { fetchRoadRoute } from '../../features/live-wari/services/routing';

const emptyRegistration = () => ({
  wari_code: '',
  name: '',
  source: '',
  destination: '',
  start_date: '',
  end_date: '',
  organizer_name: '',
  organizer_contact: '',
  description: '',
});

const emptyHalt = () => ({
  day_number: 1,
  sequence_order: 1,
  halt_name: '',
  latitude: '',
  longitude: '',
  halt_type: 'REST',
  arrival_time: '',
  departure_time: '',
  notes: '',
});

const statusTone = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  FULFILLED: 'success',
  CANCELLED: 'danger',
};

async function geocodePlace(query) {
  const clean = String(query || '').trim();

  if (!clean) {
    throw new Error('Location name is required.');
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(clean)}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to locate ${clean}.`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No map location found for ${clean}.`);
  }

  const first = data[0];

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  };
}

export default function DindiLeaderDashboard() {
  const [waris, setWaris] = useState([]);
  const [selectedWariId, setSelectedWariId] = useState('');
  const [selectedWari, setSelectedWari] = useState(null);
  const [route, setRoute] = useState(null);
  const [halts, setHalts] = useState([]);
  const [liveRequests, setLiveRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);
  const [haltsLoading, setHaltsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState(emptyRegistration());
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [haltDraft, setHaltDraft] = useState(emptyHalt());
  const [haltError, setHaltError] = useState('');
  const [haltLoading, setHaltLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    FOOD: { quantity: '20', notes: '' },
    WATER: { quantity: '50', notes: '' },
  });
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState({ FOOD: false, WATER: false });

  const selectedWariName = selectedWari?.name || 'Selected Wari';

  const loadDashboardData = async (wariId) => {
    if (!wariId) {
      setRoute(null);
      setHalts([]);
      setLiveRequests([]);
      setHistory([]);
      return;
    }

    setRouteLoading(true);
    setHaltsLoading(true);

    try {
      const [routeRecord, haltRows, activeRows, historyRows] = await Promise.all([
        getRouteByWariId(wariId),
        getWariHalts(wariId),
        listLiveResourceRequests(wariId),
        listResourceRequestHistory(wariId),
      ]);

      setRoute(routeRecord);
      setHalts(haltRows || []);
      setLiveRequests(activeRows || []);
      setHistory(historyRows || []);
    } catch (loadError) {
      console.error('Unable to load Dindi dashboard data', loadError);
      setError(loadError?.message || 'Unable to load dashboard data.');
    } finally {
      setRouteLoading(false);
      setHaltsLoading(false);
    }
  };

  const loadWaris = async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await listWaris();
      setWaris(rows || []);

      if (rows && rows.length > 0) {
        const nextSelected = rows[0];
        setSelectedWariId((previous) => previous || nextSelected.id);
        setSelectedWari(nextSelected);
      } else {
        setSelectedWariId('');
        setSelectedWari(null);
      }
    } catch (loadError) {
      console.error('Unable to load Wari list', loadError);
      setError(loadError?.message || 'Unable to load Wari list from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaris();
  }, []);

  useEffect(() => {
    if (!selectedWariId) {
      setRoute(null);
      setHalts([]);
      setLiveRequests([]);
      setHistory([]);
      return;
    }

    const selected = waris.find((item) => item.id === selectedWariId) || null;
    setSelectedWari(selected);
    loadDashboardData(selectedWariId);
  }, [selectedWariId, waris]);

  const refreshAll = async () => {
    await loadWaris();
    if (selectedWariId) {
      await loadDashboardData(selectedWariId);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    try {
      const nextValues = {
        wari_code: registerForm.wari_code.trim(),
        name: registerForm.name.trim(),
        source: registerForm.source.trim(),
        destination: registerForm.destination.trim(),
        start_date: registerForm.start_date || null,
        end_date: registerForm.end_date || null,
        organizer_name: registerForm.organizer_name.trim() || null,
        organizer_contact: registerForm.organizer_contact.trim() || null,
        description: registerForm.description.trim() || null,
      };

      if (!nextValues.wari_code || !nextValues.name || !nextValues.source || !nextValues.destination) {
        setRegisterError('Wari code, name, source and destination are required.');
        return;
      }

      const created = await createWari(nextValues);
      const nextWaris = [created, ...waris];
      setWaris(nextWaris);
      setSelectedWariId(created.id);
      setSelectedWari(created);
      setRegisterForm(emptyRegistration());
      setIsRegistering(false);
      await loadDashboardData(created.id);
    } catch (registerFailure) {
      console.error('Wari creation failed', registerFailure);
      setRegisterError(registerFailure?.message || 'Unable to create Wari.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!selectedWariId || !selectedWari) {
      return;
    }

    const sourceName = selectedWari.source?.trim();
    const destinationName = selectedWari.destination?.trim();

    if (!sourceName || !destinationName) {
      setError('Add source and destination to the selected Wari before saving a route.');
      return;
    }

    setRouteLoading(true);
    setError('');

    try {
      const [sourcePoint, destinationPoint] = await Promise.all([
        geocodePlace(sourceName),
        geocodePlace(destinationName),
      ]);

      const routePoints = [
        { lat: sourcePoint.lat, lng: sourcePoint.lng },
        { lat: destinationPoint.lat, lng: destinationPoint.lng },
      ];

      const roadRoute = await fetchRoadRoute(routePoints);

      const saved = await saveRoute({
        wari_id: selectedWariId,
        route_points: routePoints,
        checkpoints: [
          { name: sourceName, lat: sourcePoint.lat, lng: sourcePoint.lng },
          { name: destinationName, lat: destinationPoint.lat, lng: destinationPoint.lng },
        ],
        source_lat: sourcePoint.lat,
        source_lng: sourcePoint.lng,
        destination_lat: destinationPoint.lat,
        destination_lng: destinationPoint.lng,
        road_geometry: roadRoute.geometry,
        total_distance_km: Number((roadRoute.distance / 1000).toFixed(2)),
        estimated_duration_min: Math.round(roadRoute.duration / 60),
      });

      setRoute(saved);
    } catch (routeFailure) {
      console.error('Route save failed', routeFailure);
      setError(routeFailure?.message || 'Unable to save route.');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleAddHalt = async (event) => {
    event.preventDefault();

    if (!selectedWariId) {
      setHaltError('Select or register a Wari before adding a halt.');
      return;
    }

    const trimmedName = haltDraft.halt_name.trim();
    const latitude = Number(haltDraft.latitude);
    const longitude = Number(haltDraft.longitude);

    if (!trimmedName || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setHaltError('Halt name, latitude and longitude are required.');
      return;
    }

    setHaltLoading(true);
    setHaltError('');

    try {
      const payload = {
        wari_id: selectedWariId,
        day_number: Number(haltDraft.day_number) || 1,
        sequence_order: Number(haltDraft.sequence_order) || 1,
        halt_name: trimmedName,
        latitude,
        longitude,
        halt_type: haltDraft.halt_type || 'OTHER',
        arrival_time: haltDraft.arrival_time || null,
        departure_time: haltDraft.departure_time || null,
        notes: haltDraft.notes.trim() || null,
      };

      const created = await createWariHalts([payload]);
      const nextHalts = [...halts, ...(created || [])];
      setHalts(nextHalts);
      setHaltDraft(emptyHalt());
    } catch (haltFailure) {
      console.error('Unable to create halt', haltFailure);
      setHaltError(haltFailure?.message || 'Unable to save halt.');
    } finally {
      setHaltLoading(false);
    }
  };

  const handleRequestSubmit = async (resourceType) => {
    if (!selectedWariId) {
      setRequestError('Choose a Wari before submitting a request.');
      return;
    }

    const quantity = Number(requestForm[resourceType].quantity || 0);
    const notes = requestForm[resourceType].notes?.trim() || '';

    if (!quantity || quantity <= 0) {
      setRequestError(`${resourceType} quantity must be greater than zero.`);
      return;
    }

    setRequestLoading((current) => ({ ...current, [resourceType]: true }));
    setRequestError('');

    try {
      await createResourceRequest({
        wari_id: selectedWariId,
        halt_id: halts[0]?.id || null,
        resource_type: resourceType,
        quantity,
        unit: resourceType === 'FOOD' ? 'meals' : 'litres',
        notes,
        status: 'PENDING',
      });

      setRequestForm((current) => ({
        ...current,
        [resourceType]: { quantity: resourceType === 'FOOD' ? '20' : '50', notes: '' },
      }));

      const [activeRows, historyRows] = await Promise.all([
        listLiveResourceRequests(selectedWariId),
        listResourceRequestHistory(selectedWariId),
      ]);

      setLiveRequests(activeRows || []);
      setHistory(historyRows || []);
    } catch (requestFailure) {
      console.error('Request submission failed', requestFailure);
      setRequestError(requestFailure?.message || 'Unable to create resource request.');
    } finally {
      setRequestLoading((current) => ({ ...current, [resourceType]: false }));
    }
  };

  const handleFulfillRequest = async (requestId) => {
    try {
      await updateResourceRequestStatus(requestId, 'FULFILLED');
      await loadDashboardData(selectedWariId);
    } catch (issue) {
      console.error('Unable to fulfill request', issue);
      setError(issue?.message || 'Unable to update request status.');
    }
  };

  const routeDistanceText = useMemo(() => {
    if (!route || route.total_distance_km == null) {
      return 'No route yet';
    }

    return `${Number(route.total_distance_km).toFixed(1)} km`;
  }, [route]);

  const routeTimeText = useMemo(() => {
    if (!route || route.estimated_duration_min == null) {
      return 'No ETA';
    }

    return `${route.estimated_duration_min} min`;
  }, [route]);

  if (loading) {
    return (
      <div className="dindi-shell">
        <div className="dindi-loading">Loading Wari data…</div>
      </div>
    );
  }

  if (!waris.length) {
    return (
      <div className="dindi-shell">
        <style>{styles}</style>
        <div className="dindi-empty">
          <div className="dindi-empty-card">
            <h2>No Wari registered</h2>
            <button type="button" className="primary-button" onClick={() => setIsRegistering(true)}>
              Register Wari
            </button>
          </div>
        </div>

        {isRegistering ? (
          <div className="dindi-modal-backdrop" onClick={() => setIsRegistering(false)}>
            <div className="dindi-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Register Wari</h3>
                <button type="button" className="ghost-button" onClick={() => setIsRegistering(false)}>
                  Close
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="forms-grid">
                <label>
                  <span>Wari ID / Code</span>
                  <input value={registerForm.wari_code} onChange={(event) => setRegisterForm((current) => ({ ...current, wari_code: event.target.value }))} />
                </label>
                <label>
                  <span>Wari Name</span>
                  <input value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label>
                  <span>Source</span>
                  <input value={registerForm.source} onChange={(event) => setRegisterForm((current) => ({ ...current, source: event.target.value }))} />
                </label>
                <label>
                  <span>Destination</span>
                  <input value={registerForm.destination} onChange={(event) => setRegisterForm((current) => ({ ...current, destination: event.target.value }))} />
                </label>
                <label>
                  <span>Start Date</span>
                  <input type="date" value={registerForm.start_date} onChange={(event) => setRegisterForm((current) => ({ ...current, start_date: event.target.value }))} />
                </label>
                <label>
                  <span>End Date</span>
                  <input type="date" value={registerForm.end_date} onChange={(event) => setRegisterForm((current) => ({ ...current, end_date: event.target.value }))} />
                </label>
                <label>
                  <span>Organizer / Leader Name</span>
                  <input value={registerForm.organizer_name} onChange={(event) => setRegisterForm((current) => ({ ...current, organizer_name: event.target.value }))} />
                </label>
                <label>
                  <span>Organizer Contact</span>
                  <input value={registerForm.organizer_contact} onChange={(event) => setRegisterForm((current) => ({ ...current, organizer_contact: event.target.value }))} />
                </label>
                <label className="full-span">
                  <span>Description</span>
                  <textarea value={registerForm.description} onChange={(event) => setRegisterForm((current) => ({ ...current, description: event.target.value }))} rows={4} />
                </label>

                {registerError ? <div className="inline-error full-span">{registerError}</div> : null}

                <button className="primary-button full-span" type="submit" disabled={registerLoading}>
                  {registerLoading ? 'Creating Wari...' : 'Create Wari'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="dindi-shell">
      <style>{styles}</style>

      <aside className="dindi-sidebar">
        <div className="brand-row">
          <div className="brand-mark">SW</div>
          <div>
            <small>SmartVari</small>
            <strong>Dindi</strong>
          </div>
        </div>

        <div className="section-label">Wari</div>
        <select
          value={selectedWariId}
          onChange={(event) => setSelectedWariId(event.target.value)}
          className="select-control"
        >
          {waris.map((wari) => (
            <option key={wari.id} value={wari.id}>
              {wari.name || wari.wari_code || 'Unnamed Wari'}
            </option>
          ))}
        </select>

        <button type="button" className="ghost-button full-width" onClick={() => setIsRegistering(true)}>
          Register Wari
        </button>
      </aside>

      <main className="dindi-main">
        {error ? <div className="inline-error">{error}</div> : null}

        <header className="topbar">
          <div>
            <p className="eyebrow">Dindi Leader</p>
            <h1>{selectedWariName}</h1>
          </div>
          <button type="button" className="primary-button" onClick={refreshAll}>
            Refresh
          </button>
        </header>

        <section className="overview-grid">
          <article className="card large-card">
            <label>WARI</label>
            <div className="metric-row">
              <strong>{selectedWari?.wari_code || '—'}</strong>
              <span>{selectedWari?.source || 'Unknown'} → {selectedWari?.destination || 'Unknown'}</span>
            </div>
          </article>

          <article className="card large-card">
            <label>ROUTE</label>
            <div className="metric-row">
              <strong>{routeDistanceText}</strong>
              <span>{routeTimeText}</span>
            </div>
            <button className="small-button" type="button" onClick={handleSaveRoute} disabled={routeLoading}>
              {routeLoading ? 'Saving route…' : 'Save route'}
            </button>
          </article>

          <article className="card large-card">
            <label>TODAY’S HALTS</label>
            <div className="metric-row">
              <strong>{halts.length}</strong>
              <span>{halts.length ? 'planned stops' : 'no halts yet'}</span>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <div className="stack-column">
            <article className="card form-card">
              <div className="card-head">
                <h3>Route</h3>
              </div>
              <div className="route-summary">
                <span>{selectedWari?.source || 'Source'}</span>
                <span className="divider">→</span>
                <span>{selectedWari?.destination || 'Destination'}</span>
              </div>
            </article>

            <article className="card form-card">
              <div className="card-head">
                <h3>Today’s halts</h3>
              </div>

              <form onSubmit={handleAddHalt} className="forms-grid compact-grid">
                <label>
                  <span>Day</span>
                  <input type="number" min="1" value={haltDraft.day_number} onChange={(event) => setHaltDraft((current) => ({ ...current, day_number: event.target.value }))} />
                </label>
                <label>
                  <span>Sequence</span>
                  <input type="number" min="1" value={haltDraft.sequence_order} onChange={(event) => setHaltDraft((current) => ({ ...current, sequence_order: event.target.value }))} />
                </label>
                <label className="full-span">
                  <span>Halt name</span>
                  <input value={haltDraft.halt_name} onChange={(event) => setHaltDraft((current) => ({ ...current, halt_name: event.target.value }))} />
                </label>
                <label>
                  <span>Latitude</span>
                  <input type="number" step="0.000001" value={haltDraft.latitude} onChange={(event) => setHaltDraft((current) => ({ ...current, latitude: event.target.value }))} />
                </label>
                <label>
                  <span>Longitude</span>
                  <input type="number" step="0.000001" value={haltDraft.longitude} onChange={(event) => setHaltDraft((current) => ({ ...current, longitude: event.target.value }))} />
                </label>
                <label>
                  <span>Type</span>
                  <select value={haltDraft.halt_type} onChange={(event) => setHaltDraft((current) => ({ ...current, halt_type: event.target.value }))}>
                    {['START', 'REST', 'FOOD', 'WATER', 'MEDICAL', 'LUNCH', 'NIGHT', 'DESTINATION', 'OTHER'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Arrival</span>
                  <input type="time" value={haltDraft.arrival_time} onChange={(event) => setHaltDraft((current) => ({ ...current, arrival_time: event.target.value }))} />
                </label>
                <label>
                  <span>Departure</span>
                  <input type="time" value={haltDraft.departure_time} onChange={(event) => setHaltDraft((current) => ({ ...current, departure_time: event.target.value }))} />
                </label>
                <label className="full-span">
                  <span>Notes</span>
                  <textarea rows={3} value={haltDraft.notes} onChange={(event) => setHaltDraft((current) => ({ ...current, notes: event.target.value }))} />
                </label>

                {haltError ? <div className="inline-error full-span">{haltError}</div> : null}

                <button className="primary-button full-span" type="submit" disabled={haltLoading}>
                  {haltLoading ? 'Saving halt…' : 'Add halt'}
                </button>
              </form>

              <div className="list-box">
                {haltsLoading ? <div className="muted">Loading halts…</div> : null}
                {!haltsLoading && halts.length === 0 ? <div className="muted">No halts saved yet.</div> : null}

                {halts.map((halt) => (
                  <div key={halt.id} className="list-item compact-item">
                    <div>
                      <strong>{halt.halt_name}</strong>
                      <span>{halt.halt_type}</span>
                    </div>
                    <small>Day {halt.day_number} · #{halt.sequence_order}</small>
                    <small>{halt.latitude}, {halt.longitude}</small>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="stack-column">
            <article className="card form-card">
              <div className="card-head">
                <h3>Food</h3>
              </div>
              <div className="request-row">
                <input
                  type="number"
                  min="1"
                  value={requestForm.FOOD.quantity}
                  onChange={(event) => setRequestForm((current) => ({ ...current, FOOD: { ...current.FOOD, quantity: event.target.value } }))}
                />
                <textarea
                  rows={2}
                  value={requestForm.FOOD.notes}
                  onChange={(event) => setRequestForm((current) => ({ ...current, FOOD: { ...current.FOOD, notes: event.target.value } }))}
                  placeholder="Notes"
                />
                <button type="button" className="primary-button" onClick={() => handleRequestSubmit('FOOD')} disabled={requestLoading.FOOD}>
                  {requestLoading.FOOD ? 'Sending…' : 'REQUEST FOOD'}
                </button>
              </div>
            </article>

            <article className="card form-card">
              <div className="card-head">
                <h3>Water</h3>
              </div>
              <div className="request-row">
                <input
                  type="number"
                  min="1"
                  value={requestForm.WATER.quantity}
                  onChange={(event) => setRequestForm((current) => ({ ...current, WATER: { ...current.WATER, quantity: event.target.value } }))}
                />
                <textarea
                  rows={2}
                  value={requestForm.WATER.notes}
                  onChange={(event) => setRequestForm((current) => ({ ...current, WATER: { ...current.WATER, notes: event.target.value } }))}
                  placeholder="Notes"
                />
                <button type="button" className="primary-button" onClick={() => handleRequestSubmit('WATER')} disabled={requestLoading.WATER}>
                  {requestLoading.WATER ? 'Sending…' : 'REQUEST WATER'}
                </button>
              </div>
            </article>

            <article className="card list-card">
              <div className="card-head">
                <h3>Live requests</h3>
              </div>
              {liveRequests.length === 0 ? <div className="muted">No live requests.</div> : null}
              {liveRequests.map((request) => (
                <div key={request.id} className="list-item request-item">
                  <div>
                    <strong>{request.resource_type}</strong>
                    <span>{request.quantity} {request.unit}</span>
                  </div>
                  <div className={`status-badge status-${statusTone[request.status] || 'info'}`}>{request.status}</div>
                  <button type="button" className="small-button" onClick={() => handleFulfillRequest(request.id)}>
                    Fulfill
                  </button>
                </div>
              ))}
            </article>

            <article className="card list-card">
              <div className="card-head">
                <h3>History</h3>
              </div>
              {history.length === 0 ? <div className="muted">No fulfilled or cancelled requests.</div> : null}
              {history.map((request) => (
                <div key={request.id} className="list-item request-item">
                  <div>
                    <strong>{request.resource_type}</strong>
                    <span>{request.quantity} {request.unit}</span>
                  </div>
                  <div className={`status-badge status-${statusTone[request.status] || 'info'}`}>{request.status}</div>
                </div>
              ))}
            </article>
          </div>
        </section>
      </main>

      {isRegistering ? (
        <div className="dindi-modal-backdrop" onClick={() => setIsRegistering(false)}>
          <div className="dindi-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Wari</h3>
              <button type="button" className="ghost-button" onClick={() => setIsRegistering(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="forms-grid">
              <label>
                <span>Wari ID / Code</span>
                <input value={registerForm.wari_code} onChange={(event) => setRegisterForm((current) => ({ ...current, wari_code: event.target.value }))} />
              </label>
              <label>
                <span>Wari Name</span>
                <input value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Source</span>
                <input value={registerForm.source} onChange={(event) => setRegisterForm((current) => ({ ...current, source: event.target.value }))} />
              </label>
              <label>
                <span>Destination</span>
                <input value={registerForm.destination} onChange={(event) => setRegisterForm((current) => ({ ...current, destination: event.target.value }))} />
              </label>
              <label>
                <span>Start Date</span>
                <input type="date" value={registerForm.start_date} onChange={(event) => setRegisterForm((current) => ({ ...current, start_date: event.target.value }))} />
              </label>
              <label>
                <span>End Date</span>
                <input type="date" value={registerForm.end_date} onChange={(event) => setRegisterForm((current) => ({ ...current, end_date: event.target.value }))} />
              </label>
              <label>
                <span>Organizer / Leader Name</span>
                <input value={registerForm.organizer_name} onChange={(event) => setRegisterForm((current) => ({ ...current, organizer_name: event.target.value }))} />
              </label>
              <label>
                <span>Organizer Contact</span>
                <input value={registerForm.organizer_contact} onChange={(event) => setRegisterForm((current) => ({ ...current, organizer_contact: event.target.value }))} />
              </label>
              <label className="full-span">
                <span>Description</span>
                <textarea rows={4} value={registerForm.description} onChange={(event) => setRegisterForm((current) => ({ ...current, description: event.target.value }))} />
              </label>

              {registerError ? <div className="inline-error full-span">{registerError}</div> : null}

              <button className="primary-button full-span" type="submit" disabled={registerLoading}>
                {registerLoading ? 'Creating Wari...' : 'Create Wari'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {requestError ? <div className="toast-error">{requestError}</div> : null}
    </div>
  );
}

const styles = `
  :root {
    color-scheme: light;
    --smartvari-bg-1: #f8fafc;
    --smartvari-bg-2: #eff6ff;
    --smartvari-bg-3: #f0fdfa;
    --smartvari-card: rgba(255, 255, 255, 0.86);
    --smartvari-card-strong: linear-gradient(135deg, #ffffff, #f8fbff);
    --smartvari-border: #dce7f5;
    --smartvari-line: rgba(148, 163, 184, 0.2);
    --smartvari-text: #0f172a;
    --smartvari-body: #475569;
    --smartvari-muted: #64748b;
    --smartvari-label: #334155;
    --smartvari-blue: #2563eb;
    --smartvari-cyan: #06b6d4;
    --smartvari-emerald: #10b981;
    --smartvari-amber: #f59e0b;
    --smartvari-red: #ef4444;
    --shadow-soft: 0 14px 30px rgba(37, 99, 235, 0.08);
    --shadow-card: 0 10px 22px rgba(15, 23, 42, 0.06);
  }

  * { box-sizing: border-box; }

  .dindi-shell {
    min-height: 100vh;
    display: flex;
    gap: 20px;
    padding: 24px;
    background:
      radial-gradient(circle at top right, rgba(96, 165, 250, 0.16), transparent 26%),
      radial-gradient(circle at bottom left, rgba(103, 232, 249, 0.12), transparent 22%),
      linear-gradient(135deg, #f8fbff, #eef7ff, #f4fbff);
    color: var(--smartvari-text);
    font-family: Inter, Arial, sans-serif;
    font-size: 0.68rem;
  }

  .dindi-sidebar {
    width: 280px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(240, 250, 255, 0.92));
    border: 1px solid var(--smartvari-border);
    border-radius: 20px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: var(--shadow-soft);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--smartvari-line);
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--smartvari-blue), var(--smartvari-cyan));
    color: #ffffff;
    font-weight: 800;
    box-shadow: 0 12px 18px rgba(37, 99, 235, 0.18);
  }

  .brand-row small,
  .brand-row strong {
    display: block;
  }

  .brand-row small {
    color: var(--smartvari-muted);
  }

  .brand-row strong {
    color: var(--smartvari-text);
    font-size: 0.95rem;
  }

  .section-label {
    color: var(--smartvari-blue);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 800;
  }

  .select-control,
  .forms-grid input,
  .forms-grid select,
  .forms-grid textarea,
  .request-row input,
  .request-row textarea {
    width: 100%;
    border-radius: 12px;
    border: 1px solid var(--smartvari-border);
    background: rgba(255,255,255,0.75);
    color: var(--smartvari-text);
    padding: 10px 12px;
    font: inherit;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .select-control:focus,
  .forms-grid input:focus,
  .forms-grid select:focus,
  .forms-grid textarea:focus,
  .request-row input:focus,
  .request-row textarea:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.45);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
    background: #ffffff;
  }

  .forms-grid textarea,
  .request-row textarea {
    resize: vertical;
  }

  .primary-button,
  .ghost-button,
  .small-button {
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font: inherit;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .primary-button:hover,
  .ghost-button:hover,
  .small-button:hover {
    transform: translateY(-1px);
  }

  .primary-button {
    background: linear-gradient(135deg, var(--smartvari-blue), var(--smartvari-cyan));
    color: #ffffff;
    padding: 11px 14px;
    font-weight: 700;
    box-shadow: 0 12px 22px rgba(37, 99, 235, 0.18);
  }

  .small-button {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12));
    color: var(--smartvari-blue);
    border: 1px solid rgba(37, 99, 235, 0.14);
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 700;
  }

  .ghost-button {
    background: linear-gradient(135deg, #ffffff, #f8fbff);
    color: var(--smartvari-text);
    padding: 9px 12px;
    border: 1px solid var(--smartvari-border);
  }

  .full-width { width: 100%; }

  .dindi-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 2px 4px;
  }

  .eyebrow {
    margin: 0 0 6px;
    color: var(--smartvari-blue);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 800;
  }

  h1, h2, h3, p { margin: 0; }

  .topbar h1 {
    font-size: clamp(1.35rem, 1.7vw, 2rem);
    color: var(--smartvari-text);
    letter-spacing: -0.04em;
  }

  .overview-grid,
  .content-grid {
    display: grid;
    gap: 18px;
  }

  .overview-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1.15fr 1fr;
  }

  .stack-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.86));
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 22px;
    padding: 18px;
    box-shadow: var(--shadow-card);
  }

  .large-card {
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 248, 255, 0.9));
  }

  .large-card label,
  .card-head h3 {
    color: var(--smartvari-label);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 800;
  }

  .metric-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .metric-row strong {
    font-size: clamp(1.5rem, 2.2vw, 2.2rem);
    letter-spacing: -0.05em;
    color: var(--smartvari-text);
  }

  .metric-row span,
  .muted,
  .list-item span,
  .list-item small {
    color: var(--smartvari-muted);
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .forms-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .compact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .forms-grid label,
  .request-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .forms-grid span {
    color: var(--smartvari-label);
    font-size: 11px;
    font-weight: 700;
  }

  .full-span {
    grid-column: 1 / -1;
  }

  .route-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: var(--smartvari-text);
  }

  .divider {
    color: var(--smartvari-blue);
  }

  .list-box {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid var(--smartvari-border);
    background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(239,246,255,0.76));
  }

  .compact-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 8px;
  }

  .compact-item > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .request-row {
    gap: 12px;
  }

  .request-row input,
  .request-row textarea {
    min-height: 44px;
  }

  .list-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .request-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .request-item > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 82px;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .status-warning { background: rgba(245, 158, 11, 0.12); color: #b45309; }
  .status-info { background: rgba(59, 130, 246, 0.10); color: #1d4ed8; }
  .status-success { background: rgba(16, 185, 129, 0.10); color: #047857; }
  .status-danger { background: rgba(239, 68, 68, 0.10); color: #b91c1c; }

  .inline-error {
    display: block;
    color: #b91c1c;
    background: rgba(254, 226, 226, 0.9);
    border: 1px solid rgba(239, 68, 68, 0.18);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
  }

  .dindi-empty {
    width: 100%;
    display: grid;
    place-items: center;
    min-height: 100vh;
    background:
      radial-gradient(circle at top, rgba(37, 99, 235, 0.08), transparent 30%),
      linear-gradient(135deg, var(--smartvari-bg-1), var(--smartvari-bg-2), var(--smartvari-bg-3));
  }

  .dindi-empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    width: min(420px, calc(100vw - 40px));
    padding: 34px 28px;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,249,255,0.94));
    border: 1px solid rgba(148, 163, 184, 0.22);
    text-align: center;
    box-shadow: var(--shadow-soft);
  }

  .dindi-empty-card h2 {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    color: var(--smartvari-text);
  }

  .dindi-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.18);
    display: grid;
    place-items: center;
    padding: 24px;
    z-index: 20;
  }

  .dindi-modal {
    width: min(700px, 100%);
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,249,255,0.9));
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 22px;
    padding: 20px;
    box-shadow: var(--shadow-soft);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .toast-error {
    position: fixed;
    right: 18px;
    bottom: 18px;
    max-width: 400px;
    background: rgba(254, 226, 226, 0.96);
    color: #991b1b;
    border: 1px solid rgba(239, 68, 68, 0.18);
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 980px) {
    .dindi-shell { flex-direction: column; }
    .dindi-sidebar { width: 100%; }
    .overview-grid, .content-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .dindi-shell { padding: 16px; }
    .forms-grid, .compact-grid { grid-template-columns: 1fr; }
    .route-summary { flex-wrap: wrap; }
    .request-item { flex-wrap: wrap; }
  }
`;
