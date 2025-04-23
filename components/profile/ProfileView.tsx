"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProfileViewProps {
  user: {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onEditClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onEditClick }) => {
  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal account information
            </CardDescription>
          </div>
          <Button 
            onClick={onEditClick}
            className="min-h-12 rounded-1.5 px-4 py-3 bg-primary text-white font-medium"
          >
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
              <Image 
                src={user.image || "/icons/user.svg"} 
                alt="Profile" 
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm font-medium">{user.username || "No username"}</p>
          </div>

          {/* Basic Information */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Name</p>
                <p className="font-medium">{user.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Email</p>
                <p className="font-medium">{user.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Username</p>
                <p className="font-medium">{user.username || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileView;