import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/auth.config';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                User Management
              </Link>
            </li>
            <li>
              <Link
                href="/admin/content"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Content Moderation
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Order Oversight
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
