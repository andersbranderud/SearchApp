import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchForm from './SearchForm';
import { searchApi, authApi } from '../services/api';
import { SearchResult } from '../types/search';

// Mock the services and navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  authApi: {
    isAuthenticated: jest.fn(),
    getUsername: jest.fn(),
    logout: jest.fn(),
  },
  searchApi: {
    getAvailableEngines: jest.fn(),
    search: jest.fn(),
  },
}));

// Mock SearchResults component
jest.mock('./SearchResults', () => {
  return function MockSearchResults({ results }: any) {
    return (
      <div data-testid="search-results-component">
        Query: {results.query}
      </div>
    );
  };
});

// Helper function to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authApi.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.getUsername as jest.Mock).mockReturnValue('testuser');
    (searchApi.getAvailableEngines as jest.Mock).mockResolvedValue(['Google', 'Bing', 'DuckDuckGo']);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Authentication Check', () => {
    it('should redirect to login if not authenticated', async () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect if authenticated', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(searchApi.getAvailableEngines).toHaveBeenCalled();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Rendering and Initial State', () => {
    it('should display welcome message with username', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/welcome, testuser!/i)).toBeInTheDocument();
      });
    });

    it('should render logout button', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should render search input field', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
    });

    it('should render search button', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-button')).toBeInTheDocument();
      });
    });

    it('should have maxLength attribute on search input', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toHaveAttribute('maxLength', '500');
      });
    });

    it('should display search hint', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/tip.*multiple words/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading Available Engines', () => {
    it('should load and display available search engines', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(searchApi.getAvailableEngines).toHaveBeenCalled();
      });
      
      expect(await screen.findByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/bing/i)).toBeInTheDocument();
      expect(screen.getByText(/duckduckgo/i)).toBeInTheDocument();
    });

    it('should select all engines by default', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        const googleCheckbox = screen.getByTestId('engine-google');
        const bingCheckbox = screen.getByTestId('engine-bing');
        const duckduckgoCheckbox = screen.getByTestId('engine-duckduckgo');
        
        expect(googleCheckbox).toBeChecked();
        expect(bingCheckbox).toBeChecked();
        expect(duckduckgoCheckbox).toBeChecked();
      });
    });

    it('should handle error when loading engines fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.getAvailableEngines as jest.Mock).mockRejectedValue(new Error('Failed to load'));
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load available search engines/i)).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should redirect to login if loading engines returns 401', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.getAvailableEngines as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Engine Selection', () => {
    it('should toggle engine selection when checkbox is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('engine-google')).toBeChecked();
      });
      
      const googleCheckbox = screen.getByTestId('engine-google');
      await user.click(googleCheckbox);
      
      expect(googleCheckbox).not.toBeChecked();
      
      await user.click(googleCheckbox);
      expect(googleCheckbox).toBeChecked();
    });

    it('should allow deselecting all engines', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('engine-google')).toBeChecked();
      });
      
      await user.click(screen.getByTestId('engine-google'));
      await user.click(screen.getByTestId('engine-bing'));
      await user.click(screen.getByTestId('engine-duckduckgo'));
      
      expect(screen.getByTestId('engine-google')).not.toBeChecked();
      expect(screen.getByTestId('engine-bing')).not.toBeChecked();
      expect(screen.getByTestId('engine-duckduckgo')).not.toBeChecked();
    });

    it('should allow selecting specific engines', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('engine-google')).toBeChecked();
      });
      
      // Deselect all first
      await user.click(screen.getByTestId('engine-google'));
      await user.click(screen.getByTestId('engine-bing'));
      await user.click(screen.getByTestId('engine-duckduckgo'));
      
      // Select only Google
      await user.click(screen.getByTestId('engine-google'));
      
      expect(screen.getByTestId('engine-google')).toBeChecked();
      expect(screen.getByTestId('engine-bing')).not.toBeChecked();
      expect(screen.getByTestId('engine-duckduckgo')).not.toBeChecked();
    });
  });

  describe('Search Input Handling', () => {
    it('should update query value on input change', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test query');
      
      expect(searchInput).toHaveValue('test query');
    });

    it('should handle empty query', async () => {
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      
      // Input starts empty
      expect(searchInput).toHaveValue('');
    });

    it('should handle special characters in query', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'C++ programming & "design patterns"');
      
      expect(searchInput).toHaveValue('C++ programming & "design patterns"');
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty query', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-button')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/please enter a search query/i)).toBeInTheDocument();
      expect(searchApi.search).not.toHaveBeenCalled();
    });

    it('should show error when submitting with only whitespace', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), '   ');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/please enter a search query/i)).toBeInTheDocument();
      expect(searchApi.search).not.toHaveBeenCalled();
    });

    it('should show error when no engines are selected', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('engine-google')).toBeChecked();
      });
      
      // Deselect all engines
      await user.click(screen.getByTestId('engine-google'));
      await user.click(screen.getByTestId('engine-bing'));
      await user.click(screen.getByTestId('engine-duckduckgo'));
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/please select at least one search engine/i)).toBeInTheDocument();
      expect(searchApi.search).not.toHaveBeenCalled();
    });
  });

  describe('Successful Search', () => {
    it('should call search API with correct parameters', async () => {
      const user = userEvent.setup({ delay: null });
      const mockResults: SearchResult = {
        query: 'test query',
        searchEngines: ['Google', 'Bing'],
        engineTotals: { Google: 1000, Bing: 500 },
      };
      (searchApi.search as jest.Mock).mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchForm />);
      
      // Wait for engines to load
      await waitFor(() => {
        expect(screen.getByTestId('engine-google')).toBeInTheDocument();
      });
      
      // Deselect DuckDuckGo
      await user.click(screen.getByTestId('engine-duckduckgo'));
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(searchApi.search).toHaveBeenCalledWith('test query', ['Google', 'Bing']);
      });
    });

    it('should display search results on successful search', async () => {
      const user = userEvent.setup({ delay: null });
      const mockResults: SearchResult = {
        query: 'test query',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      };
      (searchApi.search as jest.Mock).mockResolvedValue(mockResults);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByTestId('search-results-component')).toBeInTheDocument();
      expect(screen.getByText(/query: test query/i)).toBeInTheDocument();
    });

    it('should clear previous results when starting new search', async () => {
      const user = userEvent.setup({ delay: null });
      const mockResults1: SearchResult = {
        query: 'first query',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      };
      const mockResults2: SearchResult = {
        query: 'second query',
        searchEngines: ['Google'],
        engineTotals: { Google: 2000 },
      };
      
      (searchApi.search as jest.Mock)
        .mockResolvedValueOnce(mockResults1)
        .mockResolvedValueOnce(mockResults2);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      // First search
      await user.type(screen.getByTestId('search-input'), 'first query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/query: first query/i)).toBeInTheDocument();
      
      // Second search - results should be cleared first
      const searchInput = screen.getByTestId('search-input');
      await user.clear(searchInput);
      await user.type(searchInput, 'second query');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText(/query: second query/i)).toBeInTheDocument();
      });
    });
  });

  describe('Failed Search', () => {
    it('should display error message on search failure', async () => {
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.search as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Search failed' } },
      });
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/search failed/i)).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('should display generic error when no error message provided', async () => {
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.search as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/search failed.*try again/i)).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('should redirect to login on 401 error', async () => {
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.search as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should not display results on failed search', async () => {
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.search as jest.Mock).mockRejectedValue(new Error('Search failed'));
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      expect(screen.queryByTestId('search-results-component')).not.toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading banner while searching', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByTestId('loading-banner')).toBeInTheDocument();
      expect(screen.getByText(/searching across/i)).toBeInTheDocument();
      
      resolveSearch!({
        query: 'test query',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-banner')).not.toBeInTheDocument();
      });
    });

    it('should disable search button while loading', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test query');
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);
      
      expect(searchButton).toBeDisabled();
      expect(searchButton).toHaveTextContent(/searching/i);
      
      resolveSearch!({
        query: 'test query',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
    });

    it('should display word count in loading banner', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'hello world test');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/analyzing "3" words/i)).toBeInTheDocument();
      
      resolveSearch!({
        query: 'hello world test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
    });

    it('should display engine count in loading banner', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByText(/searching across 3 engines/i)).toBeInTheDocument();
      
      resolveSearch!({
        query: 'test',
        searchEngines: ['Google', 'Bing', 'DuckDuckGo'],
        engineTotals: { Google: 1000, Bing: 500, DuckDuckGo: 300 },
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should logout and redirect to login page when logout is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /logout/i }));
      
      expect(authApi.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Error Clearing', () => {
    it('should clear error message when starting a new search', async () => {
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (searchApi.search as jest.Mock).mockRejectedValueOnce(new Error('Search failed'));
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      // First failed search
      await user.type(screen.getByTestId('search-input'), 'test query');
      await user.click(screen.getByTestId('search-button'));
      
      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      
      // Second search should clear error
      (searchApi.search as jest.Mock).mockResolvedValueOnce({
        query: 'new query',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
      
      const searchInput = screen.getByTestId('search-input');
      await user.clear(searchInput);
      await user.type(searchInput, 'new query');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Progress and Time Tracking', () => {
    it('should display elapsed time during search', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-banner')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/elapsed: 0s/i)).toBeInTheDocument();
      
      // Advance timers
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText(/elapsed: 2s/i)).toBeInTheDocument();
      });
      
      resolveSearch!({
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
      
      jest.useRealTimers();
    });

    it('should display estimated time during search', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      (searchApi.search as jest.Mock).mockReturnValue(searchPromise);
      
      renderWithRouter(<SearchForm />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
      
      await user.type(screen.getByTestId('search-input'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-banner')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/est\. \d+s/i)).toBeInTheDocument();
      
      resolveSearch!({
        query: 'test',
        searchEngines: ['Google'],
        engineTotals: { Google: 1000 },
      });
    });
  });
});
