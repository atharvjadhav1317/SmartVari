import React from 'react';
import ReactDOM from 'react-dom/client';

import { WariRegistrationPage } from './features/live-wari/pages/WariRegistrationPage';

import './index.css';

ReactDOM.createRoot(document.getElementById('live-wari-registration-preview-root')!).render(
  <React.StrictMode>
    <WariRegistrationPage />
  </React.StrictMode>,
);
