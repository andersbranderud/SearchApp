import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AppContent } from '../App';
import { authApi } from '../services/api';

// Mock the services
jest.mock('../services/api', () => ({
  authApi: {
    isAuthenticated: jest.fn(),
  },
  searchApi: {
    getAvailableEngines: jest.fn(),
    search: jest.fn(),
  }
}));

// Mock the child components
jest.mock('../components/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-component">Login Component</div>;
  };
});

jest.mock('../components/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-component">Register Component</div>;
  };
});

jest.mock('../components/SearchForm', () => {
  return function MockSearchForm() {
    return <div data-testid="search-form-component">SearchForm Component</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Title', () => {
    it('should render the main title', () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
      render(<App />);
      expect(screen.getByText('Multi-Engine Search')).toBeInTheDocument();
    });

    it('should render the container div with correct classes', () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
      const { container } = render(<App />);
      expect(container.querySelector('.App')).toBeInTheDocument();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
  });

  describe('Routing - Unauthenticated User', () => {
    beforeEach(() => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
    });

    it('should redirect to login page when accessing root path', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('should render login page on /login route', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/login']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('should render register page on /register route', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/register']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('register-component')).toBeInTheDocument();
    });

    it('should redirect to login when accessing protected /search route', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/search']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  describe('Routing - Authenticated User', () => {
    beforeEach(() => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(true);
    });

    it('should render search form when authenticated and accessing /search', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/search']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('search-form-component')).toBeInTheDocument();
    });

    it('should still allow access to login page when authenticated', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/login']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    it('should still allow access to register page when authenticated', () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/register']}>
          <AppContent />
        </MemoryRouter>
      );
      expect(screen.getByTestId('register-component')).toBeInTheDocument();
    });
  });

  describe('Protected Route Component', () => {
    it('should redirect to login when not authenticated accessing /search', async () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/search']}>
          <AppContent />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('login-component')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('search-form-component')).not.toBeInTheDocument();
    });

    it('should allow access to /search when authenticated', async () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(true);
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/search']}>
          <AppContent />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('search-form-component')).toBeInTheDocument();
      });
    });
  });

  describe('Invalid Routes', () => {
    it('should redirect to login for invalid routes when not authenticated', async () => {
      (authApi.isAuthenticated as jest.Mock).mockReturnValue(false);
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/invalid-route']}>
          <AppContent />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('login-component')).toBeInTheDocument();
      });
    });
  });
});
