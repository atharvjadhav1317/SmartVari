import { ChangeEvent, FormEvent, useState } from 'react';

export type SearchCriteria = {
  wariId: string;
  source: string;
  destination: string;
};

type SearchFormProps = {
  onSubmit?: (criteria: SearchCriteria) => void;
};

const normalizeValue = (value: string) => value.trim();

export function SearchForm({ onSubmit }: SearchFormProps) {
  const [wariId, setWariId] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedCriteria, setSubmittedCriteria] = useState<SearchCriteria | null>(null);

  const handleWariIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWariId(event.target.value);
  };

  const handleSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSource(event.target.value);
  };

  const handleDestinationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDestination(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextWariId = normalizeValue(wariId);
    const nextSource = normalizeValue(source);
    const nextDestination = normalizeValue(destination);

    const hasWariId = nextWariId.length > 0;
    const hasSource = nextSource.length > 0;
    const hasDestination = nextDestination.length > 0;

    if (!hasWariId && !hasSource && !hasDestination) {
      setError('Please enter a Wari ID or a source and destination to search.');
      setSubmittedCriteria(null);
      return;
    }

    if ((hasSource && !hasDestination) || (!hasSource && hasDestination)) {
      setError('Please enter both source and destination together to search by route.');
      setSubmittedCriteria(null);
      return;
    }

    const criteria: SearchCriteria = {
      wariId: nextWariId,
      source: nextSource,
      destination: nextDestination,
    };

    setError(null);
    setSubmittedCriteria(criteria);
    onSubmit?.(criteria);
  };

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="wari-id" className="block text-sm font-medium text-slate-700">
          Wari ID
        </label>
        <input
          id="wari-id"
          type="text"
          value={wariId}
          onChange={handleWariIdChange}
          autoComplete="off"
          placeholder="Enter Wari ID"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div className="flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>OR</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="source" className="block text-sm font-medium text-slate-700">
            Source
          </label>
          <input
            id="source"
            type="text"
            value={source}
            onChange={handleSourceChange}
            autoComplete="address-line1"
            placeholder="e.g. Pandharpur"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            autoComplete="address-line2"
            placeholder="e.g. Alandi"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
      >
        Search Wari
      </button>

      {error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {submittedCriteria ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Ready to search with: Wari ID {submittedCriteria.wariId || 'not provided'} / Source {submittedCriteria.source || 'not provided'} / Destination {submittedCriteria.destination || 'not provided'}
        </div>
      ) : null}
    </form>
  );
}

export default SearchForm;
