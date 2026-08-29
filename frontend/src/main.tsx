import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import WarkariLogin from './pages/warkari/WarkariLogin';
import WarkariDashboard from './pages/warkari/WarkariDashboard';
import DindiLogin from './pages/dindi/DindiLogin';
import DindiLeaderDashboard from './pages/dindi/DindiLeaderDashboard';
import { ServiceProviderDashboard } from './pages/provider/ServiceProviderDashboard';
import { LiveWariFeatureFlow } from './features/live-wari/LiveWariFeatureFlow';

import './index.css';

type Role = 'home' | 'live-wari' | 'warkari' | 'dindi' | 'provider';

function App() {
  const [role, setRole] = useState<Role>('home');
  const [authenticated, setAuthenticated] = useState(false);

  if (role === 'live-wari') {
    return <LiveWariFeatureFlow />;
  }

  if (role === 'warkari') {
    return authenticated ? (
      <WarkariDashboard />
    ) : (
      <WarkariLogin onLogin={() => setAuthenticated(true)} />
    );
  }

  if (role === 'dindi') {
    return authenticated ? (
      <DindiLeaderDashboard />
    ) : (
      <DindiLogin onLogin={() => setAuthenticated(true)} />
    );
  }

  if (role === 'provider') {
    return <ServiceProviderDashboard />;
  }

  return (
    <main className="smartvari-root-screen">
      <div className="smartvari-root-card">
        <h1>SmartVari</h1>

        <p className="smartvari-root-label">Select your role</p>

        <div className="smartvari-root-grid">
          <button className="smartvari-root-button" onClick={() => {
            setRole('live-wari');
            setAuthenticated(false);
          }}>
            Live Wari
          </button>

          <button className="smartvari-root-button" onClick={() => {
            setRole('warkari');
            setAuthenticated(false);
          }}>
            Warkari
          </button>

          <button className="smartvari-root-button" onClick={() => {
            setRole('dindi');
            setAuthenticated(false);
          }}>
            Dindi Leader
          </button>

          <button className="smartvari-root-button" onClick={() => {
            setRole('provider');
            setAuthenticated(false);
          }}>
            Service Provider
          </button>
        </div>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);