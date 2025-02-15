import { Suspense } from 'react';
import { Registry } from '../components/registry/Registry';
import { CreateRegistry } from '../components/registry/CreateRegistry';
import { useRegistry } from '../contexts/RegistryContext';

export default function RegistryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wedding Registry</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RegistryContent />
      </Suspense>
    </div>
  );
}

function RegistryContent() {
  const { registry, isLoading } = useRegistry();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!registry) {
    return <CreateRegistry />;
  }

  return <Registry registry={registry} />;
}
