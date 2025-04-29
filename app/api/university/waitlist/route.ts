import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define schema for input validation
const waitlistSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  type: z.enum(['pastor', 'student'], {
    required_error: "Please select if you're a pastor or student."
  })
});

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate request data
    const result = waitlistSchema.safeParse(body);
    
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { error: "Invalid submission", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, type } = result.data;
    
    // Check if email already exists in waitlist
    const existingUser = await prisma.waitlist.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "You're already on the waitlist!" },
        { status: 409 }
      );
    }
    
    // Add new entry to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        name,
        email,
        type
      }
    });
    
    return NextResponse.json(
      { message: "Added to waitlist successfully", id: waitlistEntry.id },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}