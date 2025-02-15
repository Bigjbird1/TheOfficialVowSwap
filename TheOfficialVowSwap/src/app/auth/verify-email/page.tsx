import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <Link 
              href="/auth/signup"
              className="font-medium text-rose-600 hover:text-rose-500"
            >
              try signing up again
            </Link>
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-rose-600 hover:text-rose-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
