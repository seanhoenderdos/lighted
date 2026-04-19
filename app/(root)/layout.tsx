import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 pt-14 sm:pt-20 max-md:pb-14 overflow-y-auto">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
