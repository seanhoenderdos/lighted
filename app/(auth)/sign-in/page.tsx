"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import AuthForm from "@/components/forms/AuthForm";
import PasswordResetRequestModal from "@/components/forms/PasswordResetRequestModal";
import { SignInSchema } from "@/lib/validations";
import ROUTES from "@/constants/routes";
import type { z } from "zod";

const SignIn = () => {
  const [showResetModal, setShowResetModal] = useState(false);

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Authentication failed", {
          description: "Invalid email or password",
        });
        return { success: false, error: result.error };
      }

      toast.success("Authentication successful!", {
        description: "Redirecting...",
      });

      // Redirect to the home page
      window.location.href = ROUTES.HOME;
      return { success: true, data: result };
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Authentication failed", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
      
      return { success: false, error };
    }
  };

  return (
    <>
      <AuthForm
        formType="SIGN_IN"
        schema={SignInSchema}
        defaultValues={{ email: "", password: "" }}
        onSubmit={onSubmit}
      />
      
      {/* Forgot Password Link */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="text-sm text-primary-blue hover:underline"
        >
          Forgot password?
        </button>
      </div>
      
      {/* Password Reset Modal */}
      <PasswordResetRequestModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
    </>
  );
};

export default SignIn;
