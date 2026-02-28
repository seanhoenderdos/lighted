'use client'

import Link from "next/link";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || '';

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/sign-in' });
  };

  return (
    <nav className="flex justify-between fixed z-50 w-full p-6 sm:px-12 border border-border-line gap-5 backdrop-blur-xl bg-background/80">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold">Lighted</span>
      </Link>

      <div className="flex items-center gap-4">
        
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Image 
                  src={session.user?.image || "/icons/user.svg"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col px-2 py-1.5">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${userId}`} className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/link-telegram" className="cursor-pointer">
                  Link Telegram
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
