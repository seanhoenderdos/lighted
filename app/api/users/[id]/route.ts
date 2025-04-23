import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { withPrismaRetry } from "@/lib/server-utils";
import bcrypt from "bcryptjs";

// GET /api/users/[id] - Get user profile
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Properly awaiting params in Next.js 15
    const { id: userId } = await context.params;

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow users to view their own profile for now
    // You can expand this later to allow viewing public profiles
    if (session.user.id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get user data from database
    const user = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Just return the user data we have
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Properly awaiting params in Next.js 15
    const { id: userId } = await context.params;

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow users to update their own profile
    if (session.user.id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();

    // Check if email is already taken by another user
    if (body.email) {
      const existingUser = await withPrismaRetry(() =>
        prisma.user.findFirst({
          where: {
            email: body.email,
            id: { not: userId },
          },
        })
      );

      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    // Check if username is already taken
    if (body.username) {
      const existingUsername = await withPrismaRetry(() =>
        prisma.user.findFirst({
          where: {
            username: body.username,
            id: { not: userId },
          },
        })
      );

      if (existingUsername) {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Handle password change if provided
    let hashedPassword: string | undefined;
    if (body.currentPassword && body.newPassword) {
      // Get current user with password
      const user = await withPrismaRetry(() =>
        prisma.user.findUnique({
          where: { id: userId },
          select: { password: true },
        })
      );

      if (!user?.password) {
        return NextResponse.json(
          { message: "User not found or password not set" },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        body.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      hashedPassword = await bcrypt.hash(body.newPassword, 10);
    }

    // Update basic user data that's in the current schema
    const updatedUser = await withPrismaRetry(() =>
      prisma.user.update({
        where: { id: userId },
        data: {
          name: body.name,
          email: body.email,
          username: body.username,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      })
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}