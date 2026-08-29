import { useState } from 'react';

import {
  WariRegistrationForm,
  type WariRegistrationFormValues,
} from '../../components/WariRegistrationForm';
import { createWari, hasSupabaseConfig } from '../../services/supabase';

type WariRegistrationPageProps = {
  onConfigureRoute?: (wariCode: string) => void;
};

export function WariRegistrationPage({ onConfigureRoute }: WariRegistrationPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdWari, setCreatedWari] = useState<{
    wari_code: string | null;
    name: string | null;
    source: string | null;
    destination: string | null;
  } | null>(null);

  const handleSubmit = async (values: WariRegistrationFormValues) => {
    if (!hasSupabaseConfig) {
      setServerError('Unable to create Wari. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const created = await createWari({
        wari_code: values.wariCode,
        name: values.name,
        source: values.source,
        destination: values.destination,
      });

      setCreatedWari(created);
      setSuccessMessage('Wari created successfully');
    } catch (error: unknown) {
      const errorObject = error as {
        code?: string;
        message?: string;
      };

      console.error('Wari registration failed', errorObject);

      if (errorObject?.code === '23505') {
        setServerError('A Wari with this ID already exists. Please use a different Wari ID.');
        return;
      }

      if (errorObject?.message && /row-level security|policy/i.test(errorObject.message)) {
        setServerError('Unable to create Wari. Database permissions need to be configured.');
        return;
      }

      setServerError('Unable to create Wari. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
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
              Register New Wari
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Create a Wari before setting its planned route.
            </p>
          </div>

          {!createdWari ? (
            <WariRegistrationForm
              isSubmitting={isSubmitting}
              serverError={serverError}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="space-y-5 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
              <div>
                <h2 className="text-xl font-semibold text-emerald-800">Wari created successfully</h2>
              </div>

              <div className="space-y-2 text-sm text-emerald-900">
                <p>
                  <span className="font-semibold">Wari Code:</span> {createdWari.wari_code || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Wari Name:</span> {createdWari.name || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Route:</span> {createdWari.source || 'Unknown'} → {createdWari.destination || 'Unknown'}
                </p>
              </div>

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  const wariCode = createdWari.wari_code || '';
                  const targetUrl = wariCode
                    ? `/live-wari-route-preview.html?wari=${encodeURIComponent(wariCode)}`
                    : '/live-wari-route-preview.html';

                  onConfigureRoute?.(wariCode);
                  window.location.href = targetUrl;
                }}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                Configure Route
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default WariRegistrationPage;
