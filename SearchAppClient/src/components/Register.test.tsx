import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { authApi } from '../services/api';

// Mock the services and navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  authApi: {
    register: jest.fn(),
  },
}));

// Helper function to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the registration form', () => {
      renderWithRouter(<Register />);
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    it('should render username input field', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should render confirm password input field', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter(<Register />);
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      renderWithRouter(<Register />);
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /login here/i })).toHaveAttribute('href', '/login');
    });

    it('should have proper input types', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });

    it('should have maxLength attributes', () => {
      renderWithRouter(<Register />);
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('maxLength', '100');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('maxLength', '200');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Form Input Handling', () => {
    it('should update username input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const input = screen.getByLabelText(/username/i);
      
      await user.type(input, 'testuser');
      expect(input).toHaveValue('testuser');
    });

    it('should update email input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const input = screen.getByLabelText(/email/i);
      
      await user.type(input, 'test@example.com');
      expect(input).toHaveValue('test@example.com');
    });

    it('should update password input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const input = screen.getByLabelText(/^password$/i);
      
      await user.type(input, 'password123');
      expect(input).toHaveValue('password123');
    });

    it('should update confirm password input value on change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const input = screen.getByLabelText(/confirm password/i);
      
      await user.type(input, 'password123');
      expect(input).toHaveValue('password123');
    });

    it('should maintain separate state for all inputs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'pass123');
      await user.type(confirmInput, 'pass123');
      
      expect(usernameInput).toHaveValue('testuser');
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('pass123');
      expect(confirmInput).toHaveValue('pass123');
    });
  });

  describe('Username Validation', () => {
    it('should show error for username shorter than 3 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'ab');
      await user.click(submitButton);
      
      expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for username with invalid characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'user@name');
      await user.click(submitButton);
      
      expect(await screen.findByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should accept valid username with letters, numbers, and underscores', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'test_user123',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'test_user123');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password1');
      await user.type(screen.getByLabelText(/confirm password/i), 'password1');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('Email Validation', () => {
    it('should show error for missing email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'testuser');
      await user.click(submitButton);
      
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'invalidemail');
      await user.click(submitButton);
      
      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for email with consecutive dots', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'test..user@example.com');
      await user.click(submitButton);
      
      expect(await screen.findByText(/email address contains invalid characters/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for email starting with dot', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, '.test@example.com');
      await user.click(submitButton);
      
      expect(await screen.findByText(/email address contains invalid characters/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should accept valid email addresses', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test.user+tag@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test.user+tag@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password1');
      await user.type(screen.getByLabelText(/confirm password/i), 'password1');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('Password Validation', () => {
    it('should show error for password shorter than 6 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'pass1');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for password without letters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), '123456');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error for password without numbers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password1');
      await user.type(screen.getByLabelText(/confirm password/i), 'password2');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('should accept valid password with letters and numbers', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('Successful Registration', () => {
    it('should call register API with correct data', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should not send confirmPassword to API', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
        const callArgs = (authApi.register as jest.Mock).mock.calls[0][0];
        expect(callArgs).not.toHaveProperty('confirmPassword');
      });
    });

    it('should store auth data in localStorage on successful registration', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token-789',
        username: 'newuser',
        email: 'new@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'new@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBe('test-token-789');
        expect(localStorage.getItem('username')).toBe('newuser');
        expect(localStorage.getItem('email')).toBe('new@example.com');
      });
    });

    it('should navigate to search page on successful registration', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });
  });

  describe('Failed Registration', () => {
    it('should display error message on registration failure with API error message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Username already exists';
      (authApi.register as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'existinguser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('should display generic error message when API error has no message', async () => {
      const user = userEvent.setup();
      (authApi.register as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/registration failed.*try again/i)).toBeInTheDocument();
    });

    it('should not navigate on failed registration', async () => {
      const user = userEvent.setup();
      (authApi.register as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Registration failed' } },
      });
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not store anything in localStorage on failed registration', async () => {
      const user = userEvent.setup();
      (authApi.register as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Registration failed' } },
      });
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
      
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('email')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      let resolveRegister: (value: any) => void;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      (authApi.register as jest.Mock).mockReturnValue(registerPromise);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(screen.getByRole('button', { name: /registering/i })).toBeInTheDocument();
      
      // Resolve the promise
      resolveRegister!({
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /registering/i })).not.toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      let resolveRegister: (value: any) => void;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      (authApi.register as jest.Mock).mockReturnValue(registerPromise);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      const loadingButton = screen.getByRole('button', { name: /registering/i });
      expect(loadingButton).toBeDisabled();
      
      // Resolve the promise
      resolveRegister!({
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('Error Handling and Clearing', () => {
    it('should clear error message when starting a new submission', async () => {
      const user = userEvent.setup();
      (authApi.register as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'Username already exists' } },
      });
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'existinguser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
      
      // Try again with different username
      (authApi.register as jest.Mock).mockResolvedValueOnce({
        token: 'test-token',
        username: 'newuser',
        email: 'test@example.com',
      });
      
      const usernameInput = screen.getByLabelText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'newuser');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      // Error should be cleared before the new submission
      await waitFor(() => {
        expect(screen.queryByText(/username already exists/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form on Enter key press in last field', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        username: 'testuser',
        email: 'test@example.com',
      };
      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);
      
      renderWithRouter(<Register />);
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123{Enter}');
      
      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('Validation Priority', () => {
    it('should validate in correct order and stop at first error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Register />);
      
      // Set invalid username (first validation)
      await user.type(screen.getByLabelText(/username/i), 'ab');
      await user.type(screen.getByLabelText(/email/i), 'invalidemail');
      await user.type(screen.getByLabelText(/^password$/i), '123');
      await user.type(screen.getByLabelText(/confirm password/i), '456');
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      // Should show username error first
      expect(await screen.findByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });
});
