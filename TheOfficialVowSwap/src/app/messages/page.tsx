import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ChatPage } from '@/app/components/chat/Chat';

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/messages');
  }

  return <ChatPage />;
}

// Add metadata for the page
export const metadata = {
  title: 'Messages | Wedding Marketplace',
  description: 'Chat with buyers and sellers on our wedding marketplace platform',
};
