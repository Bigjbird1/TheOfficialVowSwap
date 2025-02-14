import { Metadata } from 'next';
import CreateListing from '@/app/components/seller/CreateListing';

export const metadata: Metadata = {
  title: 'Create Listing - VowSwap',
  description: 'Create a new listing to sell your wedding items on VowSwap'
};

export default function CreateListingPage() {
  return <CreateListing />;
}
