'use client';

import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import NavLinks from "./NavLinks";
import { useSession, signOut } from "next-auth/react";

const MobileNavigation = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || '';

  const handleSignOut = async () => {
    await signOut({ redirect: true });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/hamburger.svg"
          width={36}
          height={36}
          alt="menu"
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="border-none"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <Link href="/" className="flex items-center
        pt-5 pl-6 gap-1">
          <Image
            src="/images/site-logo.svg"
            height={125}
            width={125}
            alt="logo"
          />
        </Link>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto p-2">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-6 pt-16">
              <NavLinks isMobileNav userId={userId} />
            </section>
          </SheetClose>

          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <SheetClose asChild>
                    <Link href={`/profile/${userId}`} className="flex items-center gap-3">
                      <Image 
                        src={session.user?.image || "/icons/user.svg"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </Link>
                  </SheetClose>
                </div>

                <SheetClose asChild>
                  <Button
                    onClick={handleSignOut}
                    className="small-medium light-border-2 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
                    type="button"
                  >
                    Sign out
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_IN}>
                    <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                      Sign in
                    </Button>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_UP}>
                    <Button className="small-medium light-border-2 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
                      Sign up
                    </Button>
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
