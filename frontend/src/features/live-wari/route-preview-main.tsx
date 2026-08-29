import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouteSetupPage } from './pages/RouteSetupPage';

import '../../index.css';

ReactDOM.createRoot(document.getElementById('live-wari-route-preview-root')!).render(
  <React.StrictMode>
    <RouteSetupPage />
  </React.StrictMode>,
);
