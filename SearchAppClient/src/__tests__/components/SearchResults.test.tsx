import React from 'react';
import { render, screen, within } from '@testing-library/react';
import SearchResults from '../../components/SearchResults';
import { SearchResult } from '../../types';

describe('SearchResults Component', () => {
  const mockResults: SearchResult = {
    query: 'test query',
    searchEngines: ['Google', 'Bing', 'DuckDuckGo'],
    engineTotals: {
      Google: 1500000,
      Bing: 850000,
      DuckDuckGo: 320000,
    },
  };

  describe('Rendering', () => {
    it('should render search results component', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    it('should display the search query', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByText(/search results for: "test query"/i)).toBeInTheDocument();
    });

    it('should display results summary text', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByText(/searched for each word separately and summed the results/i)).toBeInTheDocument();
    });

    it('should render all search engines', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/bing/i)).toBeInTheDocument();
      expect(screen.getByText(/duckduckgo/i)).toBeInTheDocument();
    });
  });

  describe('Result Counts', () => {
    it('should display result count for each engine', () => {
      render(<SearchResults results={mockResults} />);
      const googleResults = screen.getByTestId('results-google');
      const bingResults = screen.getByTestId('results-bing');
      const duckduckgoResults = screen.getByTestId('results-duckduckgo');
      
      expect(within(googleResults).getByText(/1\.5m/i)).toBeInTheDocument();
      expect(within(bingResults).getByText(/850\.0k/i)).toBeInTheDocument();
      expect(within(duckduckgoResults).getByText(/320\.0k/i)).toBeInTheDocument();
    });

    it('should format numbers correctly - millions', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 2500000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/2\.5m/i)).toBeInTheDocument();
    });

    it('should format numbers correctly - thousands', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 45000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/45\.0k/i)).toBeInTheDocument();
    });

    it('should format numbers correctly - below thousand', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 999 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/^999$/)).toBeInTheDocument();
    });

    it('should handle zero results', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 0 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/^0$/)).toBeInTheDocument();
    });
  });

  describe('Engine Display', () => {
    it('should display engine icons for all engines', () => {
      render(<SearchResults results={mockResults} />);
      const icons = screen.getAllByText('🌐');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('should display "Web Results" badge for all engines', () => {
      render(<SearchResults results={mockResults} />);
      const badges = screen.getAllByText('Web Results');
      expect(badges).toHaveLength(3);
    });

    it('should display engine names correctly', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Bing')).toBeInTheDocument();
      expect(screen.getByText('DuckDuckGo')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      render(<SearchResults results={mockResults} />);
      const googleResults = screen.getByTestId('results-google');
      expect(googleResults).toHaveClass('engine-results', 'web-search');
    });
  });

  describe('Single Engine Results', () => {
    it('should handle single engine results', () => {
      const results: SearchResult = {
        query: 'single engine test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.0m/i)).toBeInTheDocument();
    });

    it('should display correct query for single engine', () => {
      const results: SearchResult = {
        query: 'specific query',
        searchEngines: ['Bing'],
        engineTotals: { Bing: 500 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/search results for: "specific query"/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Engines', () => {
    it('should handle two engines', () => {
      const results: SearchResult = {
        query: 'two engines',
        searchEngines: ['Google', 'Bing'],
        engineTotals: {
          Google: 1000,
          Bing: 2000,
        },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/bing/i)).toBeInTheDocument();
      expect(screen.queryByText(/duckduckgo/i)).not.toBeInTheDocument();
    });

    it('should handle all three engines', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/bing/i)).toBeInTheDocument();
      expect(screen.getByText(/duckduckgo/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 999999999 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/1000\.0m/i)).toBeInTheDocument();
    });

    it('should handle query with special characters', () => {
      const results: SearchResult = {
        query: 'C++ "design patterns" & algorithms',
        searchEngines: ['Google'],
        engineTotals: { Google: 5000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/search results for: "c\+\+ "design patterns" & algorithms"/i)).toBeInTheDocument();
    });

    it('should handle long queries', () => {
      const longQuery = 'this is a very long search query with many words to test how the component handles longer text';
      const results: SearchResult = {
        query: longQuery,
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(new RegExp(`search results for: "${longQuery}"`, 'i'))).toBeInTheDocument();
    });

    it('should handle single word query', () => {
      const results: SearchResult = {
        query: 'hello',
        searchEngines: ['Google'],
        engineTotals: { Google: 50000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/search results for: "hello"/i)).toBeInTheDocument();
    });

    it('should handle engine name with underscore', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Search_Engine'],
        engineTotals: { Search_Engine: 1000 },
      };
      render(<SearchResults results={results} />);
      // Engine name should have underscore replaced with space
      const engineName = screen.getByRole('heading', { name: /search engine/i, level: 3 });
      expect(engineName).toBeInTheDocument();
      expect(engineName).toHaveTextContent('Search Engine');
    });
  });

  describe('Results Label', () => {
    it('should display "results" label', () => {
      render(<SearchResults results={mockResults} />);
      const resultsLabels = screen.getAllByText('results');
      expect(resultsLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('should have correct structure for result counts', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1500000 },
      };
      render(<SearchResults results={results} />);
      
      const googleResults = screen.getByTestId('results-google');
      const totalCount = within(googleResults).getByText(/1\.5m/i);
      const countLabel = within(googleResults).getByText('results');
      
      expect(totalCount).toBeInTheDocument();
      expect(countLabel).toBeInTheDocument();
    });
  });

  describe('Data Consistency', () => {
    it('should match engine totals with displayed engines', () => {
      render(<SearchResults results={mockResults} />);
      
      // Check that each engine in engineTotals is displayed
      Object.keys(mockResults.engineTotals).forEach(engine => {
        const engineNameDisplay = engine.replace('_', ' ');
        expect(screen.getByText(new RegExp(engineNameDisplay, 'i'))).toBeInTheDocument();
      });
    });

    it('should display correct number of engine results', () => {
      render(<SearchResults results={mockResults} />);
      
      const engineCount = Object.keys(mockResults.engineTotals).length;
      const engineResults = screen.getAllByText(/web results/i);
      
      expect(engineResults).toHaveLength(engineCount);
    });
  });

  describe('Number Formatting Edge Cases', () => {
    it('should format 1000 as 1.0K', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/1\.0k/i)).toBeInTheDocument();
    });

    it('should format 1000000 as 1.0M', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/1\.0m/i)).toBeInTheDocument();
    });

    it('should format 1234 as 1.2K', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1234 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/1\.2k/i)).toBeInTheDocument();
    });

    it('should format 1567890 as 1.6M', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1567890 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/1\.6m/i)).toBeInTheDocument();
    });

    it('should format 999 as 999 without suffix', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 999 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/^999$/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper container structure', () => {
      const { container } = render(<SearchResults results={mockResults} />);
      expect(container.querySelector('.search-results')).toBeInTheDocument();
      expect(container.querySelector('.results-summary')).toBeInTheDocument();
      expect(container.querySelector('.results-by-engine')).toBeInTheDocument();
    });

    it('should have proper engine result structure', () => {
      const { container } = render(<SearchResults results={mockResults} />);
      const engineResults = container.querySelectorAll('.engine-results');
      expect(engineResults.length).toBe(3);
      
      engineResults.forEach(result => {
        expect(result.querySelector('.engine-header')).toBeInTheDocument();
        expect(result.querySelector('.engine-title')).toBeInTheDocument();
        expect(result.querySelector('.total-count')).toBeInTheDocument();
      });
    });

    it('should have engine icon in each result', () => {
      const { container } = render(<SearchResults results={mockResults} />);
      const engineIcons = container.querySelectorAll('.engine-icon');
      expect(engineIcons.length).toBe(3);
    });

    it('should have engine type badge in each result', () => {
      const { container } = render(<SearchResults results={mockResults} />);
      const typeBadges = container.querySelectorAll('.engine-type-badge');
      expect(typeBadges.length).toBe(3);
    });
  });

  describe('Empty or Unusual Data', () => {
    it('should handle empty query string', () => {
      const results: SearchResult = {
        query: '',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/search results for: ""/i)).toBeInTheDocument();
    });

    it('should render even with no engines (edge case)', () => {
      const results: SearchResult = {
        query: 'test',
        searchEngines: [],
        engineTotals: {},
      };
      render(<SearchResults results={results} />);
      expect(screen.getByText(/search results for: "test"/i)).toBeInTheDocument();
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testids for main components', () => {
      render(<SearchResults results={mockResults} />);
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByTestId('results-google')).toBeInTheDocument();
      expect(screen.getByTestId('results-bing')).toBeInTheDocument();
      expect(screen.getByTestId('results-duckduckgo')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<SearchResults results={mockResults} />);
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent(/search results for/i);
      
      const engineHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(engineHeadings).toHaveLength(3);
    });
  });
});
