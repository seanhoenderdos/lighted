import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get all cookies
  const cookieStore = await cookies();
  
  // Delete all auth-related cookies
  const allCookies = await cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.includes('next-auth') || cookie.name.includes('__Secure-next-auth')) {
      await cookieStore.delete(cookie.name);
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Auth cookies cleared successfully' 
  });
}
