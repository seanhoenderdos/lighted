import SocialAuthForm from "@/components/forms/SocialAuthForm";
import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10">
      <section className="min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[520px] sm:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold">Lighted</h1>
          <p className="text-muted-foreground">
            Voice-to-Exegesis for Pastors
          </p>
        </div>

        {children}

        <SocialAuthForm />
      </section>
    </main>
  );
};

export default AuthLayout;
