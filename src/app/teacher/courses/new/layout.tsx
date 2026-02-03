import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return (
    <div className="w-full">
      {" "}
      <div className="w-full flex justify-center">
        <Image
          src="/logos/logo-miranga.png"
          width={200}
          height={60}
          alt="logo"
          className="w-40 sm:w-48 md:w-56 object-contain"
        />
      </div>
      {children}
    </div>
  );
};

export default layout;
