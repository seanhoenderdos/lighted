import { ProfileClient } from './profile-client';

// Server component receives the params as a Promise in Next.js 15
export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // Await and extract the id from params
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Pass the resolved id to the client component
  return <ProfileClient userId={id} />;
}
