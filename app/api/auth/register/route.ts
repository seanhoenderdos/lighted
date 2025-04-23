import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
// Import from server-utils instead of utils
import { withPrismaRetry } from "@/lib/server-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input data using Zod schema
    const validationResult = SignUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors }, 
        { status: 400 }
      );
    }
    
    const { email, name, username, password } = validationResult.data;
    
    // Check if user with email already exists - with retry
    const existingUserEmail = await withPrismaRetry(() => 
      prisma.user.findUnique({
        where: { email }
      })
    );
    
    if (existingUserEmail) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Check if user with username already exists - with retry
    const existingUsername = await withPrismaRetry(() => 
      prisma.user.findUnique({
        where: { username }
      })
    );
    
    if (existingUsername) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create the user - with retry
    const newUser = await withPrismaRetry(() => 
      prisma.user.create({
        data: {
          email,
          name,
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          createdAt: true,
          // Do not include password in response
        }
      })
    );
    
    return NextResponse.json({ 
      message: "User created successfully",
      user: newUser
    }, { status: 201 });
    
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}