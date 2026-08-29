import { LiveMap } from '../../components/LiveMap';
import { TrackingStatusCard } from '../../components/TrackingStatusCard';

type SelectedWari = {
  wariId: string;
  wariName: string;
  source: string;
  destination: string;
  status: string;
  lastUpdated: string;
  currentArea: string;
  currentLat?: number | null;
  currentLng?: number | null;
};

type TrackingPageProps = {
  selectedWari?: SelectedWari;
  wariId?: string;
  source?: string;
  destination?: string;
  currentArea?: string;
  currentStatus?: string;
  lastUpdated?: string;
  onBack?: () => void;
};

export function TrackingPage({
  selectedWari,
  wariId = selectedWari?.wariId ?? 'SW-DEMO-001',
  source = selectedWari?.source ?? 'Demo Origin',
  destination = selectedWari?.destination ?? 'Demo Destination',
  currentArea = selectedWari?.currentArea ?? 'Demo Location',
  currentStatus = selectedWari?.status ?? 'On Route',
  lastUpdated = selectedWari?.lastUpdated ?? '30 sec ago',
  onBack,
}: TrackingPageProps) {
  const sourcePosition = { lat: 18.5204, lng: 73.8567 };
  const destinationPosition = { lat: 18.5361, lng: 73.8795 };

  const hasCurrentCoordinates =
    selectedWari?.currentLat != null && selectedWari?.currentLng != null;

  const currentPosition = hasCurrentCoordinates
    ? { lat: selectedWari.currentLat as number, lng: selectedWari.currentLng as number }
    : { lat: 18.5293, lng: 73.8688 };

  const routePoints = [
    sourcePosition,
    { lat: 18.5229, lng: 73.8604 },
    currentPosition,
    { lat: 18.5328, lng: 73.8737 },
    destinationPosition,
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3 text-right">
              <span className="text-sm font-medium text-slate-500">Wari</span>
              <span className="text-lg font-semibold text-slate-900">{wariId}</span>
            </div>

            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              LIVE
            </span>
          </div>
        </header>

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          {!hasCurrentCoordinates ? (
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              Location unavailable for this Wari.
            </div>
          ) : null}

          <div className="p-3 sm:p-4">
            <LiveMap
              currentPosition={currentPosition}
              sourcePosition={sourcePosition}
              destinationPosition={destinationPosition}
              routePoints={routePoints}
            />
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <TrackingStatusCard
              wariId={wariId}
              source={source}
              destination={destination}
              currentArea={currentArea}
              currentStatus={currentStatus}
              lastUpdated={lastUpdated}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Journey</p>
              <p className="mt-2 text-base font-medium text-slate-800">
                {source} → {currentArea} → {destination}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TrackingPage;
