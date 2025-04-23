"use client";

import React from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import AuthForm from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validations";
import ROUTES from "@/constants/routes";
import type { z } from "zod";

const SignUp = () => {
  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    try {
      // Create the user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to register');
      }
      
      toast.success("Registration successful!", {
        description: "Signing you in...",
      });
      
      // Sign in the user after registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: ROUTES.HOME
      });
      
      return { success: true, data: result };
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
      
      return { success: false, error };
    }
  };

  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={onSubmit}
    />
  );
};

export default SignUp;
