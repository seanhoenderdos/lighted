import { NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, withPrismaRetry } from "@/lib/server-utils";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedFields = ForgotPasswordSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedFields.error.issues },
        { status: 400 }
      );
    }
    
    const { email } = validatedFields.data;
    
    // Find the user by email
    const user = await withPrismaRetry(() => 
      prisma.user.findUnique({
        where: { email },
      })
    );
    
    // Always return success even if user not found to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with this email, a password reset link has been sent." 
      });
    }
    
    // Generate a reset token and store it
    const token = await createPasswordResetToken(user.id);
    
    // Create reset URL
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    // Send the email with the reset link
    await sendPasswordResetEmail(email, resetLink);
    
    return NextResponse.json({ 
      success: true, 
      message: "If an account exists with this email, a password reset link has been sent." 
    });
  } catch (error) {
    console.error("[PASSWORD_RESET_REQUEST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}