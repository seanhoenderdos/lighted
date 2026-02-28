'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import BriefsLibrary from '@/components/briefs/BriefsLibrary';

const Home = () => {
  const router = useRouter();

  const handleSelectBrief = (briefId: string) => {
    // Navigate to the brief workspace
    router.push(`/brief/${briefId}`);
  };

  return (
    <main className="h-full w-full overflow-auto">
      <BriefsLibrary onSelectBrief={handleSelectBrief} />
    </main>
  );
};

export default Home;
