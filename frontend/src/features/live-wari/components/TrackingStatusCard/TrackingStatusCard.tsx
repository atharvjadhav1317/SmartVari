export type TrackingStatusCardProps = {
  wariId: string;
  source: string;
  destination: string;
  currentArea: string;
  currentStatus: string;
  lastUpdated: string;
};

export function TrackingStatusCard({
  wariId,
  source,
  destination,
  currentArea,
  currentStatus,
  lastUpdated,
}: TrackingStatusCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tracking</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentStatus}</h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          LIVE
        </span>
      </div>

      <div className="mt-5 space-y-4 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Wari ID</span>
          <span className="font-semibold text-slate-900">{wariId}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Current area</span>
          <span className="font-medium text-slate-900">{currentArea}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Last updated</span>
          <span className="font-medium text-slate-900">{lastUpdated}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Source</span>
          <span className="font-medium text-slate-900">{source}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Destination</span>
          <span className="font-medium text-slate-900">{destination}</span>
        </div>
      </div>
    </section>
  );
}

export default TrackingStatusCard;
