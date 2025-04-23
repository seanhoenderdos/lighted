"use client";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinksProps {
  isMobileNav?: boolean;
  userId?: string;
}

const NavLinks = ({ isMobileNav = false, userId }: NavLinksProps) => {
  const pathname = usePathname() || '';

  return (
    <>
      {sidebarLinks.map((item) => {
        // For profile link, simply construct the path directly
        const route = item.route === "/profile" && userId 
          ? `/profile/${userId}`  // Use direct path format
          : item.route;
          
        // Check if the current path matches this route
        const isActive =
          (pathname.includes(route) && route.length > 1) ||
          pathname === route;

        // Skip rendering profile link if not authenticated
        if (item.route === "/profile" && !userId) {
          return null;
        }

        // Create the link component
        const LinkComponent = (
          <Link
            href={route}
            key={item.label}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-dark dark:text-light",
              "flex items-center justify-start gap-4 bg-transparent p-4"
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p
              className={cn(
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden"
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
