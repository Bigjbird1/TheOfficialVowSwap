import { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/app/components/auth/SignInForm";

// Define metadata for the sign-in page to improve SEO
export const metadata: Metadata = {
  title: "Sign In - VowSwap",
  description: "Sign in to your VowSwap account",
};

export default function SignInPage() {
  return (
    // Main content wrapper with full viewport height and gradient background
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header section with welcome message and sign-up prompt */}
        <div className="text-center space-y-6 mb-8">
          <h1 
            className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent"
            aria-label="Welcome Back to VowSwap"
          >
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Your wedding dreams await
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-rose-500 hover:text-rose-600 transition"
              aria-label="Sign up for a new account"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Sign-in form container with animation */}
        <div 
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn"
          role="form"
          aria-label="Sign in form"
        >
          <SignInForm />
        </div>

        {/* Footer with legal links */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <nav className="space-x-4" aria-label="Legal">
            <Link 
              href="/privacy-policy" 
              className="hover:text-gray-700 transition"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link 
              href="/terms" 
              className="hover:text-gray-700 transition"
            >
              Terms of Service
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
