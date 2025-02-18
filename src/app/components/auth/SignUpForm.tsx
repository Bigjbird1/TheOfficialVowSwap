"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface FormErrors {
  firstName?: string;
  lastName?: string;
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
interface SignUpFormProps {
  redirectTo?: string;
}

export default function SignUpForm({ redirectTo }: SignUpFormProps) {
  const router = useRouter();
  // Track form-wide error state
  const [error, setError] = useState<string | null>(null);
  // Track loading state for submission
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!firstName || firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long";
    }

    if (!lastName || lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long";
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
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const name = `${firstName} ${lastName}`;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'SELLER', // Set default role
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError("An account with this email already exists");
        } else if (signUpError.message.includes('passwordless')) {
          setError("This email is already registered with a different sign-in method");
        } else {
          setError(signUpError.message || "Failed to create account");
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Create user in the database
        const { error: dbError } = await supabase
          .from('User')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role: 'SELLER',
            },
          ]);

        if (dbError) {
          console.error('Error creating user:', dbError);
          // Clean up auth user if database creation fails
          await supabase.auth.signOut();
          setError("Failed to complete registration. Please try again.");
          setIsLoading(false);
          return;
        }

        // Show success message and email verification notice
        setError(null);
        setIsLoading(false);
        
        // Redirect to the specified page or verification page
        router.push(redirectTo || "/auth/verify-email");
        router.refresh();
      }
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
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.firstName}
              aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
              className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder="Enter first name"
            />
            {fieldErrors.firstName && (
              <div id="firstName-error" className="text-red-500 text-sm mt-1" role="alert">
                {fieldErrors.firstName}
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.lastName}
              aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
              className="w-full px-4 py-3 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              placeholder="Enter last name"
            />
            {fieldErrors.lastName && (
              <div id="lastName-error" className="text-red-500 text-sm mt-1" role="alert">
                {fieldErrors.lastName}
              </div>
            )}
          </div>
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
            type={passwordVisible ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="w-full px-4 py-3 pr-10 border rounded-full bg-gray-50 placeholder-gray-500 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            placeholder="Create a password"
          />
          <button 
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {passwordVisible ? "🙈" : "👁️"}
          </button>
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
