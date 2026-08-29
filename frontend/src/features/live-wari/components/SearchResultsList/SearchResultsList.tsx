import { WariSummaryCard, type WariSummaryCardStatus } from '../WariSummaryCard';

export type WariSearchResult = {
  wariId: string;
  wariName: string;
  source: string;
  destination: string;
  status: WariSummaryCardStatus;
  lastUpdated: string;
  currentArea: string;
  currentLat?: number | null;
  currentLng?: number | null;
};

type SearchResultsListProps = {
  results: WariSearchResult[];
  onTrack?: (result: WariSearchResult) => void;
};

export function SearchResultsList({ results, onTrack }: SearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
        No Wari routes match this search yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <WariSummaryCard
          key={result.wariId}
          wariId={result.wariId}
          wariName={result.wariName}
          source={result.source}
          destination={result.destination}
          status={result.status}
          lastUpdated={result.lastUpdated}
          currentArea={result.currentArea}
          onTrack={() => onTrack?.(result)}
        />
      ))}
    </div>
  );
}

export default SearchResultsList;
