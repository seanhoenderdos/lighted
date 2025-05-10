import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get all cookies
  const cookieStore = cookies();
  
  // Delete all auth-related cookies
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.includes('next-auth') || cookie.name.includes('__Secure-next-auth')) {
      cookieStore.delete(cookie.name);
    }
  });
  
  return NextResponse.json({ 
    success: true, 
    message: 'Auth cookies cleared successfully' 
  });
}
