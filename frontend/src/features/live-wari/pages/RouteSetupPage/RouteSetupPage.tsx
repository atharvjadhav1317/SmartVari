import { useEffect, useMemo, useState } from 'react';

import { RouteBuilder, type Checkpoint, type RoutePoint } from '../../components/RouteBuilder';
import { hasSupabaseConfig, getWariIdByCode, saveRoute } from '../../services/supabase';

export type RouteSetupFormValues = {
  wariId: string;
  wariName: string;
  source: string;
  destination: string;
};

const emptyForm = (): RouteSetupFormValues => ({
  wariId: '',
  wariName: '',
  source: '',
  destination: '',
});

export function RouteSetupPage() {
  const [formValues, setFormValues] = useState<RouteSetupFormValues>(emptyForm);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointName, setCheckpointName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RouteSetupFormValues | 'route' | 'general', string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoadingWari, setIsLoadingWari] = useState(false);
  const [wariLoadError, setWariLoadError] = useState<string | null>(null);

  const routeError = useMemo(() => errors.route ?? null, [errors.route]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wariCode = params.get('wari')?.trim();

    if (!wariCode) {
      return;
    }

    let ignore = false;

    setIsLoadingWari(true);
    setWariLoadError(null);

    getWariIdByCode(wariCode)
      .then((record) => {
        if (ignore) {
          return;
        }

        if (!record) {
          setWariLoadError('Wari not found.');
          return;
        }

        setFormValues({
          wariId: record.wari_code ?? '',
          wariName: record.name ?? '',
          source: record.source ?? '',
          destination: record.destination ?? '',
        });
        setErrors((current) => ({ ...current, wariId: undefined, wariName: undefined, source: undefined, destination: undefined, general: undefined }));
      })
      .catch(() => {
        if (!ignore) {
          setWariLoadError('Unable to load Wari.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingWari(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateField = (field: keyof RouteSetupFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
  };

  const handleAddPoint = (point: RoutePoint) => {
    setRoutePoints((current) => [...current, point]);
    setErrors((current) => ({ ...current, route: undefined }));
  };

  const handleUndoLastPoint = () => {
    setRoutePoints((current) => current.slice(0, -1));
  };

  const handleClearRoute = () => {
    setRoutePoints([]);
    setErrors((current) => ({ ...current, route: undefined }));
  };

  const handleAddCheckpoint = () => {
    const trimmedName = checkpointName.trim();

    if (!trimmedName) {
      setErrors((current) => ({ ...current, general: 'Checkpoint name is required.' }));
      return;
    }

    if (routePoints.length === 0) {
      setErrors((current) => ({ ...current, general: 'Select a map point before adding a checkpoint.' }));
      return;
    }

    const selectedPoint = routePoints[routePoints.length - 1];

    setCheckpoints((current) => [
      ...current,
      {
        name: trimmedName,
        lat: selectedPoint.lat,
        lng: selectedPoint.lng,
      },
    ]);
    setCheckpointName('');
    setErrors((current) => ({ ...current, general: undefined }));
  };

  const handleRemoveCheckpoint = (index: number) => {
    setCheckpoints((current) => current.filter((_, checkpointIndex) => checkpointIndex !== index));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof RouteSetupFormValues | 'route', string>> = {};

    if (!formValues.wariId.trim()) {
      nextErrors.wariId = 'Wari ID is required.';
    }

    if (!formValues.wariName.trim()) {
      nextErrors.wariName = 'Wari Name is required.';
    }

    if (!formValues.source.trim()) {
      nextErrors.source = 'Source is required.';
    }

    if (!formValues.destination.trim()) {
      nextErrors.destination = 'Destination is required.';
    }

    if (routePoints.length < 2) {
      nextErrors.route = 'At least 2 route points are required.';
    }

    return nextErrors;
  };

  const handleSaveRoute = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors((current) => ({ ...current, ...validationErrors }));
      return;
    }

    if (!hasSupabaseConfig) {
      setErrors((current) => ({ ...current, general: 'Unable to save route. Please try again.' }));
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    setErrors((current) => ({ ...current, general: undefined }));

    try {
      const wariRecord = await getWariIdByCode(formValues.wariId.trim());

      if (!wariRecord) {
        setErrors((current) => ({ ...current, general: 'Wari not found. Create the Wari first.' }));
        return;
      }

      await saveRoute({
        wari_id: wariRecord.id,
        route_points: routePoints,
        checkpoints,
      });

      setSaveMessage('Route saved successfully.');
      setFormValues(emptyForm());
      setRoutePoints([]);
      setCheckpoints([]);
      setCheckpointName('');
      setErrors({});
    } catch (error: unknown) {
      console.error('Unable to save route', error);
      setErrors((current) => ({ ...current, general: 'Unable to save route. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700">
              SW
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                SmartVari
              </p>
            </div>
          </div>

          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Wari Head Route Setup
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Define the planned route before the Wari starts so it can guide live tracking later.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Wari Information</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="wari-id" className="mb-1 block text-sm font-medium text-slate-700">
                      Wari ID
                    </label>
                    <input
                      id="wari-id"
                      type="text"
                      value={formValues.wariId}
                      onChange={(event) => updateField('wariId', event.target.value)}
                      placeholder="SW-001"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                    {errors.wariId ? <p className="mt-1 text-sm text-rose-600">{errors.wariId}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="wari-name" className="mb-1 block text-sm font-medium text-slate-700">
                      Wari Name
                    </label>
                    <input
                      id="wari-name"
                      type="text"
                      value={formValues.wariName}
                      onChange={(event) => updateField('wariName', event.target.value)}
                      placeholder="Pandharpur to Alandi Wari"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                    {errors.wariName ? <p className="mt-1 text-sm text-rose-600">{errors.wariName}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-700">
                      Source
                    </label>
                    <input
                      id="source"
                      type="text"
                      value={formValues.source}
                      onChange={(event) => updateField('source', event.target.value)}
                      placeholder="Pandharpur"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                    {errors.source ? <p className="mt-1 text-sm text-rose-600">{errors.source}</p> : null}
                  </div>

                  <div>
                    <label htmlFor="destination" className="mb-1 block text-sm font-medium text-slate-700">
                      Destination
                    </label>
                    <input
                      id="destination"
                      type="text"
                      value={formValues.destination}
                      onChange={(event) => updateField('destination', event.target.value)}
                      placeholder="Alandi"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                    {errors.destination ? <p className="mt-1 text-sm text-rose-600">{errors.destination}</p> : null}
                  </div>
                </div>
              </div>

              {isLoadingWari ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                  Loading Wari...
                </div>
              ) : null}

              {wariLoadError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {wariLoadError}
                </div>
              ) : null}

              {routeError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {routeError}
                </div>
              ) : null}

              {errors.general ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {errors.general}
                </div>
              ) : null}

              {saveMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {saveMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSaveRoute}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-sky-400"
              >
                {isSaving ? 'Saving Route...' : 'Save Route'}
              </button>
            </div>

            <div>
              <RouteBuilder
                routePoints={routePoints}
                checkpoints={checkpoints}
                checkpointName={checkpointName}
                onCheckpointNameChange={setCheckpointName}
                onAddPoint={handleAddPoint}
                onUndoLastPoint={handleUndoLastPoint}
                onClearRoute={handleClearRoute}
                onAddCheckpoint={handleAddCheckpoint}
                onRemoveCheckpoint={handleRemoveCheckpoint}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RouteSetupPage;
