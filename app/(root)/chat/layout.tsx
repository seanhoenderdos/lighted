'use client';

import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <LeftSidebar />

        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;