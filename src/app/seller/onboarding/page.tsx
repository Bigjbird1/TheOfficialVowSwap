import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export default async function SellerOnboarding() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { seller: true },
  });

  if (user?.seller) {
    redirect('/seller/dashboard');
  }

  async function createSeller(formData: FormData) {
    'use server';
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return;

    await prisma.seller.create({
      data: {
        storeName: formData.get('storeName') as string,
        description: formData.get('description') as string,
        contactEmail: session.user.email,
        user: {
          connect: {
            email: session.user.email
          }
        }
      }
    });

    redirect('/seller/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Become a Seller</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <form action={createSeller}>
            <div className="space-y-6">
              <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                id="storeName"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
                  placeholder="Tell us about your business..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-rose-500 px-4 py-2 text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Create Seller Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
