import React from 'react';
import ReactDOM from 'react-dom/client';

import { LiveWariFeatureFlow } from '../LiveWariFeatureFlow';

import '../../../index.css';

ReactDOM.createRoot(document.getElementById('live-wari-preview-root')!).render(
  <React.StrictMode>
    <LiveWariFeatureFlow />
  </React.StrictMode>,
);
