"use client";

import React from "react";
import Image from "next/image";

import { Button } from "../ui/button";
import { toast } from "sonner";
import ROUTES from "@/constants/routes";
import { signIn } from "next-auth/react";

const SocialAuthForm = () => {
  const buttonClass =
    "min-h-12 flex-1 rounded-2 px-4 py-3.5";

  const handleSignIn = async (provider: "google") => {
    try {
      const result = await signIn(provider, {
        callbackUrl: ROUTES.HOME,
        redirect: false,
      });
    } catch (error) {
      console.log(error);

      toast.error("Sign-in Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in",
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">

      <Button className={buttonClass} onClick={() => handleSignIn("google")}>
        <Image
          src="/icons/google.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className= "invert-colors mr-2.5 object-contain"
        />
        <span>Sign in with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
