import { Metadata } from 'next';
import HelpCenter from '@/app/components/help/HelpCenter';

export const metadata: Metadata = {
  title: 'Help Center - Wedding Marketplace',
  description: 'Find answers to common questions about our wedding marketplace platform.',
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-8">
        <HelpCenter />
      </div>
    </main>
  );
}
