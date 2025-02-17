import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import SignInForm from '../../src/app/components/auth/SignInForm';
import { supabase } from '@/lib/supabase';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

describe('SignInForm Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test('renders email and password input fields', () => {
    render(<SignInForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('toggles password visibility', async () => {
    render(<SignInForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('handles successful sign in', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
      session: { access_token: 'token' },
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: mockSession,
      error: null,
    });

    render(<SignInForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  test('handles failed sign in attempts and rate limiting', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials', status: 400 },
    });

    render(<SignInForm />);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await userEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText(/attempts remaining/i)).toBeInTheDocument();
      });
      
      // Clear inputs for next attempt
      await userEvent.clear(screen.getByLabelText(/email/i));
      await userEvent.clear(screen.getByLabelText(/password/i));
    }

    // Verify account lockout
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/account locked for 15 minutes/i)).toBeInTheDocument();
    });
  });

  test('displays error message on network failure', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<SignInForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<SignInForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
  });

  test('handles rate limiting error from Supabase', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Too many requests', status: 429 },
    });

    render(<SignInForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
    });
  });
});
