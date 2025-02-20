'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NavBar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleListItemClick = () => {
    if (session) {
      router.push('/seller/dashboard');
    } else {
      router.push('/signin');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              VowSwap
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <>
                {session ? (
                  <Link 
                    href="/account/dashboard"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {session.user.firstName}
                  </Link>
                ) : (
                  <Link 
                    href="/signin"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                )}
                <button
                  onClick={handleListItemClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  List an Item
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
