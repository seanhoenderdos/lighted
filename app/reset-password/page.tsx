"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

import { ResetPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";

const ResetPassword = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params ? params.get("token") : null;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Validate token when component mounts
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // Token is present but we don't validate it via API until form submission
    // This prevents token leakage via unnecessary API calls
    setTokenValid(true);
  }, [token]);

  const onSubmit = async (data: z.infer<typeof ResetPasswordSchema>) => {
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/auth/password-reset/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to reset password");
        return;
      }

      toast.success("Password reset successful", {
        description: "You can now sign in with your new password",
      });
      
      // Redirect to sign-in page after successful password reset
      setTimeout(() => {
        router.push(ROUTES.SIGN_IN);
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset password", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="container flex h-screen max-w-lg items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={ROUTES.SIGN_IN} className="w-full">
              <Button className="w-full bg-primary-blue text-white">
                Return to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen max-w-lg items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your new password"
                        type="password"
                        {...field}
                        className="min-h-10 rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your new password"
                        type="password"
                        {...field}
                        className="min-h-10 rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary-blue text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link href={ROUTES.SIGN_IN} className="text-sm text-primary-blue hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;