export type WariSummaryCardStatus = 'On Route' | 'Delayed' | 'Stopped' | 'Completed';

export type WariSummaryCardProps = {
  wariId: string;
  wariName: string;
  source: string;
  destination: string;
  status: WariSummaryCardStatus;
  lastUpdated: string;
  currentArea: string;
  onTrack?: () => void;
};

const statusStyles: Record<WariSummaryCardStatus, string> = {
  'On Route': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Delayed: 'bg-amber-100 text-amber-700 ring-amber-200',
  Stopped: 'bg-rose-100 text-rose-700 ring-rose-200',
  Completed: 'bg-slate-200 text-slate-700 ring-slate-300',
};

export function WariSummaryCard({
  wariId,
  wariName,
  source,
  destination,
  status,
  lastUpdated,
  currentArea,
  onTrack,
}: WariSummaryCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              Wari ID
            </span>
            <span className="text-sm font-semibold text-slate-800">{wariId}</span>
          </div>

          <h3 className="text-xl font-semibold text-slate-900">{wariName}</h3>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-base text-slate-700">
        <span className="font-medium">{source}</span>
        <span className="text-slate-400">→</span>
        <span className="font-medium">{destination}</span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last updated</p>
          <p className="mt-1 text-base text-slate-700">{lastUpdated}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current area</p>
          <p className="mt-1 text-base text-slate-700">{currentArea}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="button"
          onClick={onTrack}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
        >
          Track Wari
        </button>
      </div>
    </article>
  );
}

export default WariSummaryCard;
