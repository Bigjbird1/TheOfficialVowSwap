import { Metadata } from "next";
import SignInForm from "@/app/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - VowSwap",
  description: "Sign in to your VowSwap account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6 mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Your wedding dreams await
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="font-medium text-rose-500 hover:text-rose-600 transition"
            >
              Sign up
            </a>
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
