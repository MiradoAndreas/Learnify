"use client"

import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { PointerHighlight } from "./ui/pointer-highlight";

// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

// Variants pour les animations
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: appleEasing,
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: appleEasing,
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: appleEasing,
    }
  }
};

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Commence à apprendre gratuitement",
      description:
        "Accède à des vidéos gratuites en malagasy pour tester Learnify et progresser sans payer.",
      skeleton: <SkeletonOne />,
      animation: fadeUp,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Paiement facile pour tous, sans carte bancaire",
      description:
        "Apprends et paie en toute simplicité avec Mobile Money : Telma, Orange ou Airtel, tout est pris en charge. Plus besoin de Visa, juste ton téléphone.",
      skeleton: <SkeletonTwo />,
      animation: slideInRight,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "Apprends tout ce que tu veux, sans limites",
      description:
        "Learnify te donne accès à un univers de compétences : programmation, design, marketing et bien plus. Ta seule limite, c’est ton ambition.",
      skeleton: <SkeletonThree />,
      animation: slideInLeft,
      className:
        "col-span-1 lg:col-span-3 lg:border-r  dark:border-neutral-800",
    },
    {
      title: "Des compétences reconnues partout dans le monde",
      description:
        "Apprends des compétences pratiques et modernes utilisées par les entreprises et les freelances à l'international.",
      skeleton: <SkeletonFour />,
      animation: fadeUp,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-5 md:py-10 max-w-7xl mx-auto">
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              className={feature.className}
              animation={feature.animation}
              index={index}
            >
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <motion.div
                className="h-full w-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: appleEasing }}
              >
                {feature.skeleton}
              </motion.div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
  animation,
  index,
}: {
  children?: React.ReactNode;
  className?: string;
  animation?: any;
  index?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={animation}
      custom={index}
      className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}
    >
      {children}
    </motion.div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (

    <PointerHighlight>
      <span className="max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">{children}</span>
    </PointerHighlight>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: 0.15, ease: appleEasing }}
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </motion.p>
  );
};

export const SkeletonOne = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: appleEasing, delay: 0.2 }}
      className="relative flex py-8 px-2 gap-10 h-full"
    >
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <Image
            src="/modal-gratuit.png"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover rounded-sm"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-linear-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-linear-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </motion.div>
  );
};

export const SkeletonThree = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.2, ease: appleEasing }}
    >
      <Image
        src="/comp-var.jpg"
        alt="image competence"
        width={800}
        height={800}
        className="rounded-lg shadow-2xl"
      />
    </motion.div>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "/airtel.jpg",
    "/telma.webp",
    "/orange.webp",
    "/airtel.jpg",
    "/telma.webp",
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
      transition: { duration: 0.3, ease: appleEasing }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden"
    >
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2, ease: appleEasing }}
        className="flex flex-row -ml-20"
      >
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3, ease: appleEasing }}
        className="flex flex-row"
      >
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
          >
            <Image
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="absolute left-0 z-100 inset-y-0 w-20 bg-linear-to-r from-white dark:from-black to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-100 inset-y-0 w-20 bg-linear-to-l from-white dark:from-black to-transparent h-full pointer-events-none" />
    </motion.div>
  );
};

export const SkeletonFour = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: appleEasing, delay: 0.2 }}
      className="h-60 md:h-60 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10"
    >
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </motion.div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};