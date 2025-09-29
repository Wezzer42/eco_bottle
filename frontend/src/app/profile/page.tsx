import { auth } from '@/lib/authOptions';
import ProfileClient from './ProfileClient';

type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    return (
      <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
        <p>Please sign in.</p>
      </main>
    );
  }
  
  const apiAccessToken = (session as typeof session & { apiAccessToken?: string }).apiAccessToken;
  let me: UserProfile | null = null;
  if (apiAccessToken) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    const r = await fetch(`${baseUrl}/api/me`, { 
      headers: { Authorization: `Bearer ${apiAccessToken}` }, 
      cache: 'no-store' 
    });
    me = r.ok ? await r.json() : null;
  }
  
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>My Profile</h1>
      {me ? (
        <ProfileClient user={me} token={apiAccessToken || ""} />
      ) : (
        <p>Failed to fetch profile.</p>
      )}
    </main>
  );
}


