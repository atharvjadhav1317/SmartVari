import { useEffect, useState } from 'react';

import { listWaris } from '../../features/live-wari/services/wari';
import './warkari.css';

const emptyProfile = { name: '', phone: '', wariId: '', emergencyContact: '', ageGroup: '' };
const facilityCards = [
  { type: 'FOOD', label: 'Food', tone: 'food' },
  { type: 'WATER', label: 'Water', tone: 'water' },
  { type: 'MEDICAL', label: 'Medical', tone: 'medical' },
];

export default function WarkariDashboard() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [waris, setWaris] = useState([]);
  const [loadingWaris, setLoadingWaris] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listWaris().then((records) => { if (active) setWaris(records); }).catch((loadError) => {
      console.error('Unable to load Wari list for Warkari dashboard', loadError);
      if (active) setError('Wari options are unavailable right now.');
    }).finally(() => { if (active) setLoadingWaris(false); });
    return () => { active = false; };
  }, []);

  const selectedWari = waris.find((wari) => wari.id === (profile?.wariId || form.wariId));
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.wariId || !form.emergencyContact.trim()) {
      setError('Please complete the required profile fields.');
      return;
    }
    setProfile({ ...form, name: form.name.trim(), phone: form.phone.trim(), emergencyContact: form.emergencyContact.trim() });
    setError('');
  };

  return (
    <main className="warkari-dashboard">
      <div className="warkari-dashboard-inner">
        <section className="warkari-hero">
          <div><span className="warkari-eyebrow">WARKARI COMPANION</span><h1>{profile ? `Welcome, ${profile.name}` : 'Follow your Wari with confidence.'}</h1><p>Stay connected to your route and the support available along the way.</p></div>
          <div className="warkari-hero-mark">SW</div>
        </section>

        <section className="warkari-card warkari-profile-section">
          <div className="warkari-section-heading"><div><span className="warkari-kicker">YOUR PROFILE</span><h2>{profile ? 'Warkari profile' : 'Join the Wari'}</h2><p>{profile ? 'Your registered details for this Wari journey.' : 'Register your details to follow your Wari and access nearby facilities.'}</p></div>{profile && <span className="warkari-status">Registered</span>}</div>
          {profile ? (
            <div className="warkari-profile-grid">
              <div><span>Name</span><strong>{profile.name}</strong></div><div><span>Mobile</span><strong>{profile.phone}</strong></div><div><span>Wari</span><strong>{selectedWari?.name || selectedWari?.wari_code || 'Selected Wari'}</strong></div><div><span>Emergency contact</span><strong>{profile.emergencyContact}</strong></div>{profile.ageGroup && <div><span>Age / group</span><strong>{profile.ageGroup}</strong></div>}<button type="button" className="warkari-text-button" onClick={() => { setForm(profile); setProfile(null); }}>Edit details</button>
            </div>
          ) : (
            <form className="warkari-registration-form" onSubmit={handleSubmit}>
              <label>Warkari name<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Your full name" required /></label>
              <label>Mobile number<input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="10-digit mobile number" inputMode="tel" required /></label>
              <label>Wari<select value={form.wariId} onChange={(event) => updateForm('wariId', event.target.value)} required disabled={loadingWaris}><option value="">{loadingWaris ? 'Loading Wari options…' : 'Select your Wari'}</option>{waris.map((wari) => <option key={wari.id} value={wari.id}>{wari.name || wari.wari_code || wari.id}</option>)}</select></label>
              <label>Emergency contact<input value={form.emergencyContact} onChange={(event) => updateForm('emergencyContact', event.target.value)} placeholder="Name and phone number" required /></label>
              <label>Age / group <span className="optional">Optional</span><input value={form.ageGroup} onChange={(event) => updateForm('ageGroup', event.target.value)} placeholder="e.g. Adult, senior, family" /></label>
              <button className="warkari-primary-button" type="submit">Register</button>
            </form>
          )}
          {error && <p className="warkari-feedback" role="alert">{error}</p>}
        </section>

        <section className="warkari-card warkari-route-card">
          <div className="warkari-section-heading"><div><span className="warkari-kicker">ON THE ROUTE</span><h2>Live Wari Route</h2><p>Food and water facilities along your route</p></div>{selectedWari && <span className="warkari-route-name">{selectedWari.source || 'Route'} → {selectedWari.destination || 'Destination'}</span>}</div>
          <div className="warkari-map-placeholder"><div className="warkari-map-orb">⌁</div><strong>Live route map</strong><span>Food &amp; water facilities will appear here</span></div>
        </section>

        <section className="warkari-facility-section" aria-label="Facility summary">
          {facilityCards.map((facility) => <article className={`warkari-facility-card ${facility.tone}`} key={facility.type}><span className="warkari-facility-dot" /><div><span>{facility.label}</span><strong>Available facilities</strong><small>Coming on route</small></div></article>)}
        </section>
      </div>
    </main>
  );
}
