import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

const App = () => {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', color: '#0f172a' }}>
      <h1>SmartVari</h1>
      <p>Frontend foundation initialized successfully.</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
