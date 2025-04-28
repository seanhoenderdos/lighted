import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import { ChatProvider } from "@/context/ChatProvider";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ChatProvider>
      <main className="background-light850_dark100 relative h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />

          <section className="flex-1 pt-24 max-md:pb-14 overflow-y-auto">
            <div className="w-full">{children}</div>
          </section>
        </div>
      </main>
    </ChatProvider>
  );
};

export default RootLayout;
