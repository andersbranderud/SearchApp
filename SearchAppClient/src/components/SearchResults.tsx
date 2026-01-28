import React from 'react';
import { SearchResult } from '../types';
import './SearchResults.css';

interface SearchResultsProps {
  results: SearchResult;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEngineType = (engine: string): 'web' => {
    return 'web';
  };

  const getEngineIcon = (engine: string): string => {
    return '🌐';
  };

  const getResultLabel = (engine: string): string => {
    return 'Web Results';
  };

  return (
    <div className="search-results" data-testid="search-results">
      <h2>Search Results for: "{results.query}"</h2>
      
      <div className="results-summary">
        <p className="summary-text">
          Searched for each word separately and summed the results from each search engine.
        </p>
      </div>

      <div className="results-by-engine">
        {Object.entries(results.engineTotals).map(([engine, total]) => {
          const engineType = getEngineType(engine);
          return (
            <div 
              key={engine} 
              className={`engine-results ${engineType}-search`} 
              data-testid={`results-${engine.toLowerCase()}`}
            >
              <div className="engine-header">
                <div className="engine-title">
                  <span className="engine-icon">{getEngineIcon(engine)}</span>
                  <h3 className="engine-name">{engine.replace('_', ' ')}</h3>
                  <span className="engine-type-badge">{getResultLabel(engine)}</span>
                </div>
                <div className="total-count">
                  <span className="count-value">{formatNumber(total)}</span>
                  <span className="count-label">results</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
