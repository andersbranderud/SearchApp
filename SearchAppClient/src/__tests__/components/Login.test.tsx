import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/Login';
import { authApi } from '../../services/api';

// Mock the services and navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

// Helper function to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the login form', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('should render email/username input field', () => {
      renderWithRouter(<Login />);
      expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderWithRouter(<Login />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render link to registration page', () => {
      renderWithRouter(<Login />);
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register here/i })).toHaveAttribute('href', '/register');
    });

    it('should have proper input types', () => {
      renderWithRouter(<Login />);
      expect(screen.getByLabelText(/email or username/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Input Handling', () => {
    it('should update email/username input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const input = screen.getByLabelText(/email or username/i);
      
      await user.type(input, 'testuser');
      expect(input).toHaveValue('testuser');
    });

    it('should update password input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const input = screen.getByLabelText(/^password$/i);
      
      await user.type(input, 'password123');
      expect(input).toHaveValue('password123');
    });

    it('should maintain separate state for both inputs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'pass123');
      
      expect(emailInput).toHaveValue('user@example.com');
      expect(passwordInput).toHaveValue('pass123');
    });

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await user.type(emailInput, 'user+test@example.com');
      await user.type(passwordInput, 'P@ssw0rd!#$');
      
      expect(emailInput).toHaveValue('user+test@example.com');
      expect(passwordInput).toHaveValue('P@ssw0rd!#$');
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting with empty fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.click(submitButton);
      
      expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should show error when email/username is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.click(submitButton);
      
      expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
      expect(authApi.login).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    it('should call login API with correct credentials', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          emailOrUsername: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should store auth data in localStorage on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token-123',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBe('test-token-123');
        expect(localStorage.getItem('username')).toBe('testuser');
        expect(localStorage.getItem('email')).toBe('test@example.com');
      });
    });

    it('should navigate to search page on successful login', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });

    it('should work with email address', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          emailOrUsername: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Failed Login', () => {
    it('should display error message on login failure with API error message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      (authApi.login as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('should display generic error message when API error has no message', async () => {
      const user = userEvent.setup();
      (authApi.login as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(await screen.findByText(/login failed.*check your credentials/i)).toBeInTheDocument();
    });

    it('should not navigate on failed login', async () => {
      const user = userEvent.setup();
      (authApi.login as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      });
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not store anything in localStorage on failed login', async () => {
      const user = userEvent.setup();
      (authApi.login as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      });
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
      
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('email')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      (authApi.login as jest.Mock).mockReturnValue(loginPromise);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
      
      // Resolve the promise
      resolveLogin!({
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /logging in/i })).not.toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      (authApi.login as jest.Mock).mockReturnValue(loginPromise);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      const loadingButton = screen.getByRole('button', { name: /logging in/i });
      expect(loadingButton).toBeDisabled();
      
      // Resolve the promise
      resolveLogin!({
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('Error Handling and Clearing', () => {
    it('should clear error message when starting a new submission', async () => {
      const user = userEvent.setup();
      (authApi.login as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
      });
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      // First failed attempt
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
      
      // Change password and submit again
      (authApi.login as jest.Mock).mockResolvedValueOnce({
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      });
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);
      
      // Error should be cleared before the new submission
      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Login />);
      const emailInput = screen.getByLabelText(/email or username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await user.type(emailInput, 'testuser');
      await user.type(passwordInput, 'password123{Enter}');
      
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });
    });
  });
});
