"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import Image from "next/image";
import ROUTES from "@/constants/routes";

const SignOutButton = () => {
  return (
    <Button
      className="small-medium light-border-2 btn-tertiary min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
      onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
    >
      <Image
        src="/icons/sign-up.svg"
        alt="logout"
        width={20}
        height={20}
        className="invert-colors lg:hidden"
      />
      <span className="max-lg:hidden">Sign out</span>
    </Button>
  );
};

export default SignOutButton;