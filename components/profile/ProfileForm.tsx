"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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
    <Card className="border-border">
      {/* Basic Profile Information Form */}
      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onSubmitProfile)}
          className="font-montserrat"
        >
          <CardHeader className="border-b border-border">
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Basic Information - Side by side on desktop */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <CardFooter className="border-t border-border pt-6 flex flex-wrap justify-between md:justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="min-h-12 rounded-1.5 px-4 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="min-h-12 rounded-1.5 px-4 py-3 bg-primary text-white font-medium"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
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
          <Card className="border-border bg-muted/30">
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

                <CardFooter className="border-t border-border pt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordSection(false)}
                    className="min-h-12 rounded-1.5 px-4 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingPassword}
                    className="min-h-12 rounded-1.5 px-4 py-3 bg-primary text-white font-medium"
                  >
                    {isSavingPassword ? "Updating..." : "Update Password"}
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