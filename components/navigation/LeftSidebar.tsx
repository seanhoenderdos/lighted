import React from "react";
import NavLinks from "./navbar/NavLinks";
import ROUTES from "@/constants/routes";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";

// Keep the LeftSidebar as a server component
const LeftSidebar = async () => {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id || '';

  return (
    <section className="custom-scrollbar bg-dark border border-border-line sticky left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-gray-400 dark:shadow-none max-sm:hidden lg:w-[266px]">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks userId={userId} />
      </div>

      <div className="flex flex-col gap-3">
        {isAuthenticated ? (
          <>
            {/* Ensure we're using the actual ID from the session */}
            <Link 
              href={`/profile/${userId}`} 
              className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
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
            {/* Use the client component for sign out */}
            <SignOutButton />
          </>
        ) : (
          <>
            <Button
              className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_IN}>
                <Image
                  src="/icons/account.svg"
                  alt="account"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">Sign in</span>
              </Link>
            </Button>

            <Button
              className="small-medium light-border-2 btn-tertiary min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_UP}>
                <Image
                  src="/icons/sign-up.svg"
                  alt="account"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">Sign up</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default LeftSidebar;
