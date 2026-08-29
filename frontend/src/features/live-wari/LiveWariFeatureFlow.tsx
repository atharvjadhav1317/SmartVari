import { useState } from 'react';

import { type SearchCriteria } from './components/SearchForm';
import { type WariSearchResult } from './components/SearchResultsList';
import { SearchPage } from './pages/SearchPage';
import { TrackingPage } from './pages/TrackingPage';
import {
  hasSupabaseConfig,
  mapWariToSearchResult,
  searchWarisById,
  searchWarisByRoute,
} from './services/supabase';

export function LiveWariFeatureFlow() {
  const [searchResults, setSearchResults] = useState<WariSearchResult[]>([]);
  const [selectedWari, setSelectedWari] = useState<WariSearchResult | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (criteria: SearchCriteria) => {
    setIsSearching(true);
    setErrorMessage(null);
    setSelectedWari(null);
    setIsTracking(false);
    setHasSearched(true);

    try {
      if (!hasSupabaseConfig) {
        setSearchResults([]);
        setErrorMessage('Unable to search right now. Please try again.');
        return;
      }

      const hasWariId = criteria.wariId.trim().length > 0;
      const records = hasWariId
        ? await searchWarisById(criteria.wariId)
        : await searchWarisByRoute(criteria.source, criteria.destination);

      const results = records.map(mapWariToSearchResult);
      setSearchResults(results);

      if (results.length === 0) {
        setErrorMessage(null);
      }
    } catch (error: unknown) {
      const errorObject = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      console.error('Live Wari search failed', {
        message: errorObject?.message,
        details: errorObject?.details,
        hint: errorObject?.hint,
        code: errorObject?.code,
      });

      setSearchResults([]);
      setErrorMessage('Unable to search right now. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrack = (result: WariSearchResult) => {
    setSelectedWari(result);
    setIsTracking(true);
  };

  const handleBack = () => {
    setSelectedWari(null);
    setIsTracking(false);
  };

  if (isTracking && selectedWari) {
    return <TrackingPage selectedWari={selectedWari} onBack={handleBack} />;
  }

  return (
    <SearchPage
      results={searchResults}
      isLoading={isSearching}
      errorMessage={errorMessage}
      hasSearched={hasSearched}
      onSearch={handleSearch}
      onTrack={handleTrack}
    />
  );
}

export default LiveWariFeatureFlow;
