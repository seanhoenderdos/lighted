"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Basic profile form schema (without password fields)
const basicProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address." }),
});

// Password update schema
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Using the same UserData type from the profile page
interface UserData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileFormProps {
  userId: string;
  initialData: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
  onCancel: () => void;
  onSaveSuccess: (updatedData: UserData) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  userId,
  initialData,
  onCancel,
  onSaveSuccess,
}) => {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Initialize profile form with default values
  const profileForm = useForm<z.infer<typeof basicProfileSchema>>({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      username: initialData.username || "",
      email: initialData.email || "",
    },
  });

  // Initialize password form
  const passwordForm = useForm<z.infer<typeof passwordUpdateSchema>>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle basic profile information update
  const onSubmitProfile = async (data: z.infer<typeof basicProfileSchema>) => {
    setIsSavingProfile(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      toast.success("Profile updated successfully");
      onSaveSuccess(updatedData);
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to update profile", {
        description: errorMessage,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password update separately
  const onSubmitPassword = async (data: z.infer<typeof passwordUpdateSchema>) => {
    setIsSavingPassword(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      
      // Reset password form
      passwordForm.reset();
      
      // Hide password section
      setShowPasswordSection(false);
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to update password", {
        description: errorMessage,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Card className="border-border overflow-hidden shadow-md mb-10">
      {/* Basic Profile Information Form */}
      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onSubmitProfile)}
          className="font-montserrat"
        >
          <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-transparent py-8 flex flex-col justify-center">
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            <CardDescription className="text-sm mt-1">Manage your personal information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6 px-6">
            {/* Basic Information - Side by side on desktop */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image 
                    src="/icons/user.svg" 
                    width={16} 
                    height={16} 
                    alt="Basic Information"
                    className="opacity-70" 
                  />
                </div>
                <h3 className="font-semibold text-xl">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2.5">
                      <FormLabel className="font-montserrat">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          {...field}
                          className="min-h-12 rounded-1.5 border"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2.5">
                      <FormLabel className="font-montserrat">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="username"
                          {...field}
                          className="min-h-12 rounded-1.5 border"
                          required
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Your unique username will be used in your profile URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2.5">
                      <FormLabel className="font-montserrat">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@example.com"
                          type="email"
                          {...field}
                          className="min-h-12 rounded-1.5 border"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border pt-6 px-6 pb-6 flex flex-wrap justify-between gap-4 bg-muted/5">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="min-h-12 rounded-lg px-6 py-3 border-border/60 hover:bg-muted/20 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="min-h-12 rounded-lg px-6 py-3 bg-primary text-white font-medium hover:bg-primary/90 w-full sm:w-auto"
            >
              {isSavingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Saving...</span>
                </>
              ) : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>

      <Separator className="my-6" />

      {/* Password Section Toggle */}
      <div className="px-6 pb-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full justify-start"
        >
          <span className="mr-2">{showPasswordSection ? "−" : "+"}</span>
          Change Password
        </Button>
      </div>

      {/* Password Update Form - Only shown when toggled */}
      {showPasswordSection && (
        <div className="px-6 pb-6">
          <Card className="border-border/50 bg-muted/10 overflow-hidden shadow-sm">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="font-montserrat">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-2.5">
                        <FormLabel className="font-montserrat">Current Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your current password"
                            type="password"
                            {...field}
                            className="min-h-12 rounded-1.5 border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-2.5">
                        <FormLabel className="font-montserrat">New Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your new password"
                            type="password"
                            {...field}
                            className="min-h-12 rounded-1.5 border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-2.5">
                        <FormLabel className="font-montserrat">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirm your new password"
                            type="password"
                            {...field}
                            className="min-h-12 rounded-1.5 border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="border-t border-border/30 pt-6 flex flex-wrap justify-between gap-4 bg-muted/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordSection(false)}
                    className="min-h-12 rounded-lg px-4 py-3 border-border/60 hover:bg-muted/20 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingPassword}
                    className="min-h-12 rounded-lg px-6 py-3 bg-primary text-white font-medium hover:bg-primary/90 w-full sm:w-auto"
                  >
                    {isSavingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Updating...</span>
                      </>
                    ) : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default ProfileForm;