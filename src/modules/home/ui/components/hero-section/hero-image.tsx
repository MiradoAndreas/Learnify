import Image from "next/image";

export const HeroImage = () => {
  return (
    <div>
      <Image src="/banner.png" width={700} height={700} alt="Banner" />
    </div>
  );
};
