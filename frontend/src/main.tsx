import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import SmartVariNavbar from './components/SmartVariNavbar';
import WarkariLogin from './pages/warkari/WarkariLogin';
import WarkariDashboard from './pages/warkari/WarkariDashboard';
import DindiLogin from './pages/dindi/DindiLogin';
import DindiLeaderDashboard from './pages/dindi/DindiLeaderDashboard';
import { ServiceProviderDashboard } from './pages/provider/ServiceProviderDashboard';
import { LiveWariFeatureFlow } from './features/live-wari/LiveWariFeatureFlow';
import { AboutUsPage } from './pages/info/AboutUsPage';
import { ContactUsPage } from './pages/info/ContactUsPage';
import { HelpPage } from './pages/info/HelpPage';

import './index.css';

type Role = 'home' | 'about' | 'contact' | 'help' | 'live-wari' | 'warkari' | 'dindi' | 'provider';

function App() {
  const [role, setRole] = useState<Role>('home');
  const [authenticated, setAuthenticated] = useState(false);

  const handleNavigate = (nextRole: Role) => {
    setRole(nextRole);
    setAuthenticated(false);
  };

  const navPage = role === 'about' ? 'about' : role === 'contact' ? 'contact' : role === 'help' ? 'help' : 'home';

  const content = (() => {
    if (role === 'about') {
      return <AboutUsPage />;
    }

    if (role === 'contact') {
      return <ContactUsPage />;
    }

    if (role === 'help') {
      return <HelpPage />;
    }

    if (role === 'live-wari') {
      return <LiveWariFeatureFlow />;
    }

    if (role === 'warkari') {
      return authenticated ? <WarkariDashboard /> : <WarkariLogin onLogin={() => setAuthenticated(true)} />;
    }

    if (role === 'dindi') {
      return authenticated ? <DindiLeaderDashboard /> : <DindiLogin onLogin={() => setAuthenticated(true)} />;
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
            <button className="smartvari-root-button" onClick={() => handleNavigate('live-wari')}>
              Live Wari
            </button>

            <button className="smartvari-root-button" onClick={() => handleNavigate('warkari')}>
              Warkari
            </button>

            <button className="smartvari-root-button" onClick={() => handleNavigate('dindi')}>
              Dindi Leader
            </button>

            <button className="smartvari-root-button" onClick={() => handleNavigate('provider')}>
              Service Provider
            </button>
          </div>
        </div>
      </main>
    );
  })();

  return (
    <>
      <SmartVariNavbar currentPage={navPage} onNavigate={handleNavigate} />
      {content}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);