import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, authApi } from '../services/api';
import { SearchResult } from '../types/search';
import SearchResults from './SearchResults';
import './SearchForm.css';

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [availableEngines, setAvailableEngines] = useState<string[]>([]);
  const [selectedEngines, setSelectedEngines] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const username = authApi.getUsername();
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadAvailableEngines();
  }, [navigate]);

  const loadAvailableEngines = async (): Promise<void> => {
    try {
      const engines = await searchApi.getAvailableEngines();
      setAvailableEngines(engines);
      // Select all engines by default
      setSelectedEngines(engines);
    } catch (err: any) {
      console.error('Failed to load search engines:', err);
      if (err.response?.status === 401) {
        authApi.logout();
        navigate('/login');
      } else {
        setError('Failed to load available search engines');
      }
    }
  };

  const handleEngineToggle = (engine: string): void => {
    setSelectedEngines(prev => {
      if (prev.includes(engine)) {
        return prev.filter(e => e !== engine);
      } else {
        return [...prev, engine];
      }
    });
  };

  const handleLogout = (): void => {
    authApi.logout();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (selectedEngines.length === 0) {
      setError('Please select at least one search engine');
      return;
    }

    // Calculate estimated time: ~2-3 seconds per engine (optimized with parallelization)
    const wordCount = query.trim().split(/\s+/).length;
    const estimatedSeconds = Math.ceil((selectedEngines.length * 2.5) + (wordCount * 0.5));
    setEstimatedTime(estimatedSeconds);
    setElapsedTime(0);
    
    setLoading(true);

    // Start elapsed time counter
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerInterval(interval);

    try {
      const searchResults = await searchApi.search(query, selectedEngines);
      setResults(searchResults);
    } catch (err: any) {
      console.error('Search failed:', err);
      if (err.response?.status === 401) {
        authApi.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  return (
    <div className="search-form-container">
      <div className="user-info">
        <span>Welcome, {username}!</span>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <form onSubmit={handleSubmit} className="search-form" data-testid="search-form">
        <div className="form-group">
          <label htmlFor="searchQuery">Search Query</label>
          <input
            id="searchQuery"
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query (e.g., 'Hello world')..."
            data-testid="search-input"
            maxLength={500}
          />
          <small className="hint">Tip: Enter multiple words to search for each word separately and see the total hits.</small>
        </div>

        <div className="form-group">
          <label>Select Search Engines</label>
          <div className="engines-container" data-testid="engines-container">
            {availableEngines.map(engine => (
              <label key={engine} className="engine-checkbox">
                <input
                  type="checkbox"
                  checked={selectedEngines.includes(engine)}
                  onChange={() => handleEngineToggle(engine)}
                  data-testid={`engine-${engine.toLowerCase()}`}
                />
                <span>🌐 {engine}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="error-message" data-testid="error-message">{error}</div>}

        {loading && (
          <div className="loading-banner" data-testid="loading-banner">
            <div className="loading-content">
              <div className="spinner"></div>
              <div className="loading-text">
                <h3>Searching across {selectedEngines.length} engine{selectedEngines.length > 1 ? 's' : ''}...</h3>
                <p className="loading-details">
                  Analyzing "{query.trim().split(/\s+/).length}" word{query.trim().split(/\s+/).length > 1 ? 's' : ''} across multiple search engines
                </p>
                <div className="time-info">
                  <span className="elapsed-time">Elapsed: {elapsedTime}s</span>
                  <span className="estimated-time">Est. {estimatedTime}s</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min((elapsedTime / estimatedTime) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="search-button"
          disabled={loading}
          data-testid="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results && <SearchResults results={results} />}
    </div>
  );
};

export default SearchForm;
