"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import AuthErrorAlert from "./AuthErrorAlert";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

const handleAuthError = (error: AuthError) => {
  switch (error.status) {
    case 400:
      return "Invalid credentials";
    case 429:
      return "Too many attempts. Please try again later";
    default:
      return error.message || "An unexpected error occurred";
  }
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Check for password reset success
  useEffect(() => {
    if (searchParams?.get("reset") === "success") {
      setSuccessMessage("Your password has been successfully reset. Please sign in with your new password.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if account is locked
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / (60 * 1000));
      setError(`Too many failed attempts. Please try again in ${minutesLeft} minutes.`);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION;
          setLockoutUntil(lockoutTime);
          setError(`Account locked for 15 minutes due to too many failed attempts.`);
          // Reset attempts after lockout
          setAttempts(0);
        } else {
          setError(`${handleAuthError(signInError)} ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        
        setIsLoading(false);
        return;
      }

      // Successful login
      if (data?.session) {
        // Refresh the session
        await supabase.auth.refreshSession();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto">
      {successMessage && (
        <AuthErrorAlert message={successMessage} intent="success" className="mb-6" />
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder="Email address"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 pr-10 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder="Password"
            />
            <button 
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && <AuthErrorAlert message={error} intent="error" />}

        <div className="flex items-center justify-between">
          <a
            href="/auth/forgot-password"
            className="text-sm font-medium text-rose-600 hover:text-rose-500"
          >
            Forgot your password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 text-white font-medium rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            className="font-medium text-rose-600 hover:text-rose-500"
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
