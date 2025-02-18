"use client";

import { useState } from "react";
import AuthErrorAlert from "./AuthErrorAlert";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          options: {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "An error occurred");
      } else {
        setSuccessMessage(
          "If an account exists with this email, you will receive password reset instructions shortly."
        );
        setEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Reset Your Password
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            placeholder="Enter your email"
          />
        </div>

        {error && <AuthErrorAlert message={error} intent="error" />}
        {successMessage && <AuthErrorAlert message={successMessage} intent="success" />}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 text-white font-medium rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Reset Instructions"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <a
            href="/auth/signin"
            className="font-medium text-rose-600 hover:text-rose-500"
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
