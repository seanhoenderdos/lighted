import Image from "next/image";
import Link from "next/link";
import React from "react";
import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";

const Navbar = () => {
  return (
    <nav className="flex justify-between fixed z-50 w-full p-6 dark:shadow-none sm:px-12 border border-border-line gap-5 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={125}
          height={125}
          alt="lighted Logo"
        />
      </Link>

      <div className="flex-between gap-5">
        <Theme />

        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
