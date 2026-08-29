import { SearchForm, type SearchCriteria } from '../../components/SearchForm';
import { SearchResultsList, type WariSearchResult } from '../../components/SearchResultsList';

type SearchPageProps = {
  results?: WariSearchResult[];
  isLoading?: boolean;
  errorMessage?: string | null;
  hasSearched?: boolean;
  onSearch?: (criteria: SearchCriteria) => void;
  onTrack?: (result: WariSearchResult) => void;
};

export function SearchPage({
  results = [],
  isLoading = false,
  errorMessage = null,
  hasSearched = false,
  onSearch,
  onTrack,
}: SearchPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
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

          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Where is your Wari?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Find your Wari using its unique ID or search by its route.
            </p>
          </div>

          <div className="mt-8">
            <SearchForm onSubmit={onSearch} />
          </div>

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
              Searching for Wari...
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage && hasSearched && results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              No Wari found for your search.
            </div>
          ) : null}

          {!isLoading && results.length > 0 ? (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Search results</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                  {results.length} found
                </span>
              </div>
              <SearchResultsList results={results} onTrack={onTrack} />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default SearchPage;
