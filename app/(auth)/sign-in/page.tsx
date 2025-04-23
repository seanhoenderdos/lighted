"use client";

import React from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import AuthForm from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validations";
import ROUTES from "@/constants/routes";
import type { z } from "zod";

const SignIn = () => {
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
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={onSubmit}
    />
  );
};

export default SignIn;
