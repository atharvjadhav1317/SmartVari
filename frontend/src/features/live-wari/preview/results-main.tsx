import React from 'react';
import ReactDOM from 'react-dom/client';

import { SearchResultsList, type WariSearchResult } from '../components/SearchResultsList';

import '../../../index.css';

const demoResults: WariSearchResult[] = [
  {
    wariId: 'SW-DEMO-001',
    wariName: 'Demo Wari Route 01',
    source: 'Demo Origin',
    destination: 'Demo Destination',
    status: 'On Route',
    lastUpdated: '2 min ago',
    currentArea: 'Demo Location',
  },
  {
    wariId: 'SW-DEMO-002',
    wariName: 'Demo Wari Route 02',
    source: 'Demo Origin',
    destination: 'Demo Destination',
    status: 'Delayed',
    lastUpdated: '7 min ago',
    currentArea: 'Demo Checkpoint',
  },
  {
    wariId: 'SW-DEMO-003',
    wariName: 'Demo Wari Route 03',
    source: 'Demo Origin',
    destination: 'Demo Destination',
    status: 'Stopped',
    lastUpdated: '12 min ago',
    currentArea: 'Demo Halt Area',
  },
];

ReactDOM.createRoot(document.getElementById('live-wari-results-preview-root')!).render(
  <React.StrictMode>
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">SmartVari</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Search Results
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              These are the Wari routes matching your search.
            </p>
          </div>

          <div className="mb-5 text-sm font-medium text-slate-600">
            {demoResults.length} Wari routes found
          </div>

          <SearchResultsList results={demoResults} />
        </section>
      </div>
    </main>
  </React.StrictMode>,
);
