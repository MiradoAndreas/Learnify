import Image from "next/image";
import { motion } from "framer-motion"

// Animation easing personnalisé type Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      ease: appleEasing,
    },
  }
}

const card = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 30,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: appleEasing,
    }
  },
}

export const WithSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true, // Animation ne se déclenche qu'une seule fois
        amount: 0.2,
        margin: "-30px",
      }}
      variants={container}
      className="flex flex-col gap-y-8"
    >
      <motion.h1
        variants={card}
        className="text-md font-semibold text-center"
      >
        Avec <span className="text-xl font-bold">Learnify</span>
      </motion.h1>

      <motion.div variants={container}>
        {/* 1ère ligne */}
        <div className="flex">
          <motion.div
            variants={card}
            whileHover={{
              scale: 1.02,
              rotate: -1,
              transition: { duration: 0.3, ease: appleEasing }
            }}
            className="bg-card max-w-[280px] text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit translate-x-4"
          >
            <div className="flex items-center gap-x-1.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Image
                  src="/check.svg"
                  alt="check"
                  width={20}
                  height={20}
                />
              </motion.div>
              <h3 className="text-green-400 font-semibold text-balance">
                Cours combiné théorie et pratique
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Tu pratiques immédiatement avec des exercices et des projets concrets guidés.</p>
            </div>
          </motion.div>

          <motion.div
            variants={card}
            whileHover={{
              scale: 1.02,
              rotate: -14,
              transition: { duration: 0.3, ease: appleEasing }
            }}
            className="bg-card max-w-[280px] text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-[-15deg]"
          >
            <div className="flex items-center gap-x-1.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              >
                <Image
                  src="/check.svg"
                  alt="check"
                  width={20}
                  height={20}
                />
              </motion.div>
              <h3 className="text-green-400 font-semibold text-balance">
                Progression claire et structurée
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Chaque étape est logique, tu sais toujours quoi apprendre ensuite.</p>
            </div>
          </motion.div>
        </div>

        {/* 2ème ligne */}
        <div className="max-w-fit mx-auto">
          <motion.div
            variants={card}
            whileHover={{
              scale: 1.02,
              rotate: 21,
              transition: { duration: 0.3, ease: appleEasing }
            }}
            className="bg-card max-w-[280px] text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-20"
          >
            <div className="flex items-center gap-x-1.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                <Image
                  src="/check.svg"
                  alt="check"
                  width={20}
                  height={20}
                />
              </motion.div>
              <h3 className="text-green-400 font-semibold text-balance">
                Motivation constante
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Tu avances avec des objectifs clairs et un sentiment constant de progression.</p>
            </div>
          </motion.div>
        </div>

        {/* 3ème ligne */}
        <div className="flex">
          <motion.div
            variants={card}
            whileHover={{
              scale: 1.02,
              rotate: 1,
              transition: { duration: 0.3, ease: appleEasing }
            }}
            className="bg-card max-w-[280px] text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit"
          >
            <div className="flex items-center gap-x-1.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              >
                <Image
                  src="/check.svg"
                  alt="check"
                  width={20}
                  height={20}
                />
              </motion.div>
              <h3 className="text-green-400 font-semibold text-balance">
                Portfolio concret
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Construis des projets réels que tu peux montrer fièrement.</p>
            </div>
          </motion.div>

          <motion.div
            variants={card}
            whileHover={{
              scale: 1.02,
              rotate: -19,
              transition: { duration: 0.3, ease: appleEasing }
            }}
            className="bg-card max-w-[280px] text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-[-20deg]"
          >
            <div className="flex items-center gap-x-1.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
              >
                <Image
                  src="/check.svg"
                  alt="check"
                  width={20}
                  height={20}
                />
              </motion.div>
              <h3 className="text-green-400 font-semibold text-balance">
                Cours en malagasy
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Comprends directement, sans traduire.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};