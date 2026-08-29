import React from 'react';
import ReactDOM from 'react-dom/client';

import { TrackingPage } from '../pages/TrackingPage';

import '../../../index.css';

const demoWari = {
  wariId: 'SW-DEMO-001',
  wariName: 'Demo Wari Route 01',
  source: 'Demo Origin',
  destination: 'Demo Destination',
  status: 'On Route',
  lastUpdated: '2 min ago',
  currentArea: 'Demo Location',
};

ReactDOM.createRoot(document.getElementById('live-wari-tracking-preview-root')!).render(
  <React.StrictMode>
    <TrackingPage
      selectedWari={demoWari}
      wariId={demoWari.wariId}
      source={demoWari.source}
      destination={demoWari.destination}
      currentArea={demoWari.currentArea}
      currentStatus={demoWari.status}
      lastUpdated={demoWari.lastUpdated}
    />
  </React.StrictMode>,
);
