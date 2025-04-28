import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Get user preferences
export async function GET() {
  try {
    // Get current session to identify user
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        denomination: true,
        church: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      denomination: user.denomination || 'non-denominational',
      church: user.church || '',
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// Update user preferences
export async function POST(req: NextRequest) {
  try {
    const { denomination, church } = await req.json();
    
    // Get current session to identify user
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use upsert instead of update to create a user if they don't exist
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        denomination,
        church,
        updatedAt: new Date(),
      },
      create: {
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image || '',
        denomination,
        church,
      },
      select: {
        id: true,
        denomination: true,
        church: true,
      }
    });
    
    return NextResponse.json({
      denomination: user.denomination || 'non-denominational',
      church: user.church || '',
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}