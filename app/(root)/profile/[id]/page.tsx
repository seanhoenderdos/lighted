"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileView from "@/components/profile/ProfileView";
import ProfileForm from "@/components/profile/ProfileForm";

// Define user data type
interface UserData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfilePageProps {
  params: {
    id: string;
  }
}

const ProfilePage: React.FC<ProfilePageProps> = ({ params }) => {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check if current user is viewing their own profile
  useEffect(() => {
    if (status === "loading") return;
    
    // If not authenticated, redirect to sign in
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    // Get user data
    const getUserData = async () => {
      setIsLoading(true);
      
      try {
        const currentUserId = params.id;
        
        // Check if user is viewing their own profile, otherwise redirect
        if (session?.user?.id !== currentUserId) {
          // For security, only allow users to edit their own profiles
          router.push(`/`);
          return;
        }

        // Fetch the user profile data
        const response = await fetch(`/api/users/${currentUserId}`);
        if (!response.ok) {
          throw new Error("Failed to load profile data");
        }

        const data = await response.json();
        setUserData(data as UserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Could not load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [params, session, status, router]);

  // Handle successful profile update
  const handleProfileUpdate = async (updatedData: UserData) => {
    // Update local state with new data
    setUserData((prev: UserData | null) => ({
      ...prev as UserData,
      ...updatedData
    }));

    // Update the session if name or email have changed
    if (
      session?.user &&
      (session.user.name !== updatedData.name ||
        session.user.email !== updatedData.email)
    ) {
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: updatedData.name,
          email: updatedData.email,
        },
      });
    }

    // Switch back to view mode
    setIsEditing(false);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 font-montserrat">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Account</h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update your account information" : "View and manage your account settings"}
        </p>
      </div>
      
      {isEditing && userData ? (
        <ProfileForm
          userId={userData.id}
          initialData={userData}
          onCancel={() => setIsEditing(false)}
          onSaveSuccess={handleProfileUpdate}
        />
      ) : userData ? (
        <ProfileView
          user={userData}
          onEditClick={() => setIsEditing(true)}
        />
      ) : null}
    </div>
  );
};

export default ProfilePage;
