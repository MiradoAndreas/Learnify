// FooterSection.tsx
"use client";

import { Footer } from "../components/footer";
import { motion } from "framer-motion";

// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

export const FooterSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: appleEasing }}
      className="mt-50 md:mt-80 z-50s"
    >
      <Footer />
    </motion.section>
  );
};