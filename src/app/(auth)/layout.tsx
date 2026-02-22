import Image from "next/image";
import React from "react";
interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center mb-12">
      <div className="w-full flex justify-center">
        <Image
          src="/logos/logo-miranga.png"
          width={220}
          height={60}
          alt="logo"
          className="w-40 sm:w-48 md:w-56 object-contain"
        />
      </div>
      {children}
    </div>
  );
};

export default Layout;
