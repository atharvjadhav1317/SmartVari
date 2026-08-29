import React, { useState } from 'react';
import './warkari.css';

export default function WarkariDashboard() {
  // Local state management for form inputs, SOS, and request tracking
  const [shareLocation, setShareLocation] = useState(true);
  const [requestCategory, setRequestCategory] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isHelpConfirmed, setIsHelpConfirmed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // SOS trigger handler
  const handleSOS = () => {
    alert("ALERT: Emergency SOS triggered! Sending your current GPS location to the nearest control room.");
  };

  // Submit request handler
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestCategory) {
      alert("Please select a request category.");
      return;
    }
    alert(`Request Submitted!\nCategory: ${requestCategory}\nDetails: ${requestDetails}`);
    setRequestCategory('');
    setRequestDetails('');
  };

  // Feedback handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText) return;
    alert("Thank you for your feedback!");
    setFeedbackText('');
  };

  return (
    <div className="warkari-app" style={styles.body}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <i className="fa-solid fa-om"></i> Wari Portal
        </div>
        <ul style={styles.navList}>
          <li style={styles.navItem}>
            <a href="#dashboard" style={{ ...styles.navLink, ...styles.navLinkActive }}>
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </a>
          </li>
          <li style={styles.navItem}>
            <a href="#map" style={styles.navLink}>
              <i className="fa-solid fa-map-location-dot"></i> Live Route & Tracking
            </a>
          </li>
          <li style={styles.navItem}>
            <a href="#services" style={styles.navLink}>
              <i className="fa-solid fa-hand-holding-heart"></i> Service Request
            </a>
          </li>
          <li style={styles.navItem}>
            <a href="#reports" style={styles.navLink}>
              <i className="fa-solid fa-bullhorn"></i> Report Lost / Missing
            </a>
          </li>
          <li style={styles.navItem}>
            <a href="#feedback" style={styles.navLink}>
              <i className="fa-solid fa-comment-dots"></i> Feedback
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Header Bar */}
        <header style={styles.topHeader}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Warkari Dashboard</h2>
          <div style={styles.userProfile}>
            <button style={styles.btnSos} onClick={handleSOS}>
              <i className="fa-solid fa-triangle-exclamation"></i> SEND SOS ALERT
            </button>
            <div>
              <strong>Welcome, Warkari</strong>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>ID: Wari-2026-8891</p>
            </div>
          </div>
        </header>

        {/* Dashboard Grid View */}
        <main style={styles.dashboardContent}>
          {/* Map & Emergency Section */}
          <div style={styles.grid2}>
            {/* Live Map Panel */}
            <div style={{...styles.card, transform: hoveredCard === 'map' ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredCard === 'map' ? '0 12px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'}} onMouseEnter={() => setHoveredCard('map')} onMouseLeave={() => setHoveredCard(null)}>
              <div style={styles.cardHeader}>
                <span><i className="fa-solid fa-route"></i> Live Palkhi Location & Route</span>
                <label style={{ fontSize: '0.85rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareLocation}
                    onChange={(e) => setShareLocation(e.target.checked)}
                    style={{ marginRight: '6px' }}
                  />
                  Share My Location
                </label>
              </div>
              <div style={styles.mapBox}>
                <i className="fa-solid fa-map-marked-alt fa-3x"></i>
                <p style={{ margin: '5px 0' }}>Interactive Map Component Loading...</p>
                <small>(Displays Route, Live Palkhi Position, and Night Halts)</small>
              </div>
            </div>

            {/* Quick Emergency Help */}
            <div style={{...styles.card, transform: hoveredCard === 'emergency' ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredCard === 'emergency' ? '0 12px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'}} onMouseEnter={() => setHoveredCard('emergency')} onMouseLeave={() => setHoveredCard(null)}>
              <div style={styles.cardHeader}>
                <span><i className="fa-solid fa-headset"></i> Quick Emergency Help</span>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#64748b' }}>
                  Directly access desk support or raise an urgent assistance request.
                </p>
                <button style={{ ...styles.emergencyBtnRed, transform: hoveredBtn === 'police' ? 'scale(1.02)' : 'scale(1)', marginBottom: '0.5rem' }} onMouseEnter={() => setHoveredBtn('police')} onMouseLeave={() => setHoveredBtn(null)}>
                  <i className="fa-solid fa-user-shield"></i> Locate Police Help Desk
                </button>
                <button style={{ ...styles.emergencyBtnGreen, transform: hoveredBtn === 'ambulance' ? 'scale(1.02)' : 'scale(1)' }} onMouseEnter={() => setHoveredBtn('ambulance')} onMouseLeave={() => setHoveredBtn(null)}>
                  <i className="fa-solid fa-truck-medical"></i> Call Nearest Ambulance
                </button>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div style={{...styles.card, transform: hoveredCard === 'amenities' ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredCard === 'amenities' ? '0 12px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'}} onMouseEnter={() => setHoveredCard('amenities')} onMouseLeave={() => setHoveredCard(null)} id="facilities">
            <div style={styles.cardHeader}>
              <span><i className="fa-solid fa-magnifying-glass-location"></i> Find Nearby Amenities</span>
            </div>
            <div style={styles.grid4}>
              <button style={{...styles.facilityBtn, transform: hoveredBtn === 'food' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)', boxShadow: hoveredBtn === 'food' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'}} onMouseEnter={() => setHoveredBtn('food')} onMouseLeave={() => setHoveredBtn(null)}><i className="fa-solid fa-utensils" style={{ fontSize: '1.5rem' }}></i> Food Centres</button>
              <button style={{...styles.facilityBtn, transform: hoveredBtn === 'water' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)', boxShadow: hoveredBtn === 'water' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'}} onMouseEnter={() => setHoveredBtn('water')} onMouseLeave={() => setHoveredBtn(null)}><i className="fa-solid fa-bottle-water" style={{ fontSize: '1.5rem' }}></i> Water Points</button>
              <button style={{...styles.facilityBtn, transform: hoveredBtn === 'medical' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)', boxShadow: hoveredBtn === 'medical' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'}} onMouseEnter={() => setHoveredBtn('medical')} onMouseLeave={() => setHoveredBtn(null)}><i className="fa-solid fa-suitcase-medical" style={{ fontSize: '1.5rem' }}></i> Medical Camps</button>
              <button style={{...styles.facilityBtn, transform: hoveredBtn === 'stays' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)', boxShadow: hoveredBtn === 'stays' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'}} onMouseEnter={() => setHoveredBtn('stays')} onMouseLeave={() => setHoveredBtn(null)}><i className="fa-solid fa-bed" style={{ fontSize: '1.5rem' }}></i> Night Halts / Stays</button>
              <button style={{...styles.facilityBtn, transform: hoveredBtn === 'toilets' ? 'translateY(-4px) scale(1.02)' : 'translateY(0)', boxShadow: hoveredBtn === 'toilets' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'}} onMouseEnter={() => setHoveredBtn('toilets')} onMouseLeave={() => setHoveredBtn(null)}><i className="fa-solid fa-restroom" style={{ fontSize: '1.5rem' }}></i> Toilets & Sanitation</button>
            </div>
          </div>

          {/* Interactive Form & Request Tracker */}
          <div style={styles.grid2}>
            {/* Submit Request Form */}
            <div style={{...styles.card, transform: hoveredCard === 'form' ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredCard === 'form' ? '0 12px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'}} onMouseEnter={() => setHoveredCard('form')} onMouseLeave={() => setHoveredCard(null)}>
              <div style={styles.cardHeader}>
                <span><i className="fa-solid fa-pen-to-square"></i> Submit Incident / Service Request</span>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Request Category</label>
                  <select
                    style={styles.input}
                    value={requestCategory}
                    onChange={(e) => setRequestCategory(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    <option value="Service Request">Service Request</option>
                    <option value="Report Missing Person">Report Missing Person</option>
                    <option value="Report Lost Item">Report Lost Item</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Details / Description</label>
                  <textarea
                    rows={3}
                    style={styles.input}
                    placeholder="Provide information..."
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" style={styles.btnSubmit}>Submit Request</button>
              </form>
            </div>

            {/* Status Tracking & Feedback Panel */}
            <div style={{...styles.card, transform: hoveredCard === 'tracking' ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredCard === 'tracking' ? '0 12px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)'}} onMouseEnter={() => setHoveredCard('tracking')} onMouseLeave={() => setHoveredCard(null)}>
              <div style={styles.cardHeader}>
                <span><i className="fa-solid fa-clock-rotate-left"></i> Track Requests & Feedback</span>
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', borderLeft: '3px solid #d97706', paddingLeft: '10px' }}>
                <strong>Request #REQ-1042</strong> (Water Supply)
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0' }}>
                  Status: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Resolved</span>
                </p>
                <button
                  onClick={() => setIsHelpConfirmed(true)}
                  disabled={isHelpConfirmed}
                  style={{
                    marginTop: '5px',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    border: '1px solid #e2e8f0',
                    background: isHelpConfirmed ? '#f1f5f9' : '#fff',
                    cursor: isHelpConfirmed ? 'default' : 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {isHelpConfirmed ? "✓ Help Confirmed" : "Confirm Help Received"}
                </button>
              </div>

              <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

              <form onSubmit={handleFeedbackSubmit} style={styles.formGroup}>
                <label style={styles.label}>Submit Feedback</label>
                <input
                  type="text"
                  placeholder="How was your experience?"
                  style={styles.input}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button type="submit" style={{ ...styles.btnSubmit, marginTop: '0.5rem', background: '#3b82f6' }}>
                  Send Feedback
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// React CSS-in-JS Styling Object
const styles = {
  body: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
  },
  sidebarBrand: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  navList: { listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 },
  navItem: { marginBottom: '0.5rem' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    color: '#64748b',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#92400e',
    borderLeft: '4px solid #d97706',
    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
  },
  mainWrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#ffffff'
  },
  topHeader: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 'none',
    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 40
  },
  userProfile: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  btnSos: {
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 16px rgba(220, 38, 38, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  dashboardContent: { padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  cardHeader: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '0.75rem',
    color: '#1e293b'
  },
  facilityBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '1.2rem',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    color: '#0f172a',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  facilityBtnRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  emergencyBtnRed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    backgroundColor: '#fff5f5',
    color: '#991b1b',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
  },
  emergencyBtnGreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
  },
  mapBox: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    height: '220px',
    borderRadius: '10px',
    border: '2px dashed #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: '#64748b'
  },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#475569', fontWeight: 600 },
  input: { 
    width: '100%', 
    padding: '0.75rem', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    backgroundColor: '#ffffff', 
    boxSizing: 'border-box',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.9rem',
    fontFamily: 'inherit'
  },
  btnSubmit: { 
    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', 
    color: 'white', 
    border: 'none', 
    padding: '0.75rem 1.5rem', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    width: '100%', 
    fontWeight: 'bold',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
    fontSize: '0.95rem'
  }
};
