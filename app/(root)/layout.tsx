import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="background-light850_dark100 relative h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 pt-24 max-md:pb-14 overflow-y-auto">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
