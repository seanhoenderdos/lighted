import { NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { validatePasswordResetToken, withPrismaRetry } from "@/lib/server-utils";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Get the token from the request
    const { token, password } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }
    
    // Validate the password
    const validatedFields = ResetPasswordSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid password", details: validatedFields.error.issues },
        { status: 400 }
      );
    }
    
    // Validate the token
    const { isValid, userId } = await validatePasswordResetToken(token);
    
    if (!isValid || !userId) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    await withPrismaRetry(() => 
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
    );
    
    // Delete the used token
    await withPrismaRetry(() => 
      prisma.passwordResetToken.deleteMany({
        where: { userId },
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Password has been reset successfully" 
    });
  } catch (error) {
    console.error("[PASSWORD_RESET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}