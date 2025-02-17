"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and type from URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || type !== "email") {
          setVerificationStatus("error");
          setError("Invalid verification link");
          return;
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setVerificationStatus("error");
          setError(error.message);
          return;
        }

        setVerificationStatus("success");
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        setVerificationStatus("error");
        setError("An unexpected error occurred");
      }
    };

    // Only verify if there's a token in the URL
    if (searchParams.get("token")) {
      verifyEmail();
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {verificationStatus === "loading" && !searchParams.get("token") ? (
          <>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent you a verification email. Please click the link in the
              email to verify your account.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-rose-600 hover:text-rose-500 font-medium"
              >
                Return to Sign In
              </button>
            </div>
          </>
        ) : verificationStatus === "loading" ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        ) : verificationStatus === "success" ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to the dashboard...
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || "Unable to verify your email. Please try again."}
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-rose-600 hover:text-rose-500 font-medium"
              >
                Return to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
