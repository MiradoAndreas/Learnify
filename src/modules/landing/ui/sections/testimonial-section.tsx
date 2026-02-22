"use client"

import dynamic from 'next/dynamic'
import { motion } from "framer-motion"

const AnimatedTestimonialsDemo = dynamic(
  () => import("../components/animated-testimonials-demo").then(mod => mod.AnimatedTestimonialsDemo),
  {
    ssr: false,
    // Optionnel : ajouter un loading state
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
    )
  }
)


export const TestimonialSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="uppercase font-bold text-2xl text-[#ffb74d] text-center"
        >
          Testimonials
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]"
        >
          Des connaissances, mais pas de vraies compétences
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-md lg:text-lg text-center text-muted-foreground"
        >
          Regarder des cours ne suffit plus. Sans pratique guidée et projets réels, il est difficile de transformer l’apprentissage en résultats professionnels.
        </motion.p>

      </div>
      <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col items-center gap-4 p-4">
        <AnimatedTestimonialsDemo />
      </motion.div>
    </section>
  )
}
