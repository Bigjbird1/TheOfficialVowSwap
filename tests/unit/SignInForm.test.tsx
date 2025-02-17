/// <reference types="jest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignInForm from '../../src/app/components/auth/SignInForm';

// Mock next-auth and next/navigation
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SignInForm Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (signIn as jest.Mock).mockReset();
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
    (signIn as jest.Mock).mockResolvedValueOnce({ error: null });
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
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });
    render(<SignInForm />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await userEvent.click(signInButton);
      await waitFor(() => {
        expect(screen.getByText(/attempts remaining/i)).toBeInTheDocument();
      });
    }

    // Verify account lockout
    await userEvent.click(signInButton);
    await waitFor(() => {
      expect(screen.getByText(/account locked for 15 minutes/i)).toBeInTheDocument();
    });
  });

  test('displays error message on network failure', async () => {
    (signIn as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<SignInForm />);

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    (signIn as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<SignInForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
  });
});
