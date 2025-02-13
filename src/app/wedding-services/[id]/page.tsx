'use client';

import { PhotographerListing } from '../../wedding-services/components/PhotographerListing';
import { useParams } from 'next/navigation';

export default function VendorDetailsPage() {
  const params = useParams();
  const vendorId = params.id;

  // For now, we're just rendering the static PhotographerListing component
  // In a real implementation, you would fetch the vendor data using the vendorId
  return <PhotographerListing />;
}
