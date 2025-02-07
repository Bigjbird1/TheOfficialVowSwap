"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * SignUpForm Component
 * 
 * A form component for user registration that includes:
 * - Client-side validation
 * - Accessibility features
 * - Loading states
 * - Error handling
 * - Password strength requirements
 */
export default function SignUpForm() {
  const router = useRouter();
  // Track form-wide error state
  const [error, setError] = useState<string | null>(null);
  // Track loading state for submission
  const [isLoading, setIsLoading] = useState(false);
  // Track individual field errors
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  // Track if form has been touched for animation
  const [isVisible, setIsVisible] = useState(false);

  // Fade in the form when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  /**
   * Validates email format using regex
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validates password strength
   * Requirements: 8+ chars, 1+ number, 1+ uppercase, 1+ lowercase
   */
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * Validates form fields and returns true if all fields are valid
   */
  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!name || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(password)) {
      newErrors.password = "Password must be 8+ characters with numbers, uppercase and lowercase letters";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Validate form before submission
    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Error signing in after registration");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form 
      className={`mt-8 space-y-6 max-w-md mx-auto opacity-0 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : ""
      }`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Sign up form"
    >
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            placeholder="Enter your full name"
          />
          {fieldErrors.name && (
            <div id="name-error" className="text-red-500 text-sm mt-1" role="alert">
              {fieldErrors.name}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            placeholder="Enter your email address"
          />
          {fieldErrors.email && (
            <div id="email-error" className="text-red-500 text-sm mt-1" role="alert">
              {fieldErrors.email}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            placeholder="Create a password"
          />
          {fieldErrors.password && (
            <div id="password-error" className="text-red-500 text-sm mt-1" role="alert">
              {fieldErrors.password}
            </div>
          )}
        </div>
      </div>

      {/* Form-wide error messages */}
      {error && (
        <div 
          className="text-red-500 text-sm text-center mt-2" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          aria-disabled={isLoading}
          className="w-full py-3 px-6 text-white font-medium rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {isLoading ? (
            <>
              <span className="opacity-0">Creating account...</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            "Sign up"
          )}
        </button>
      </div>
    </form>
  );
}
