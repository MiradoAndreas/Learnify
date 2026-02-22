"use client"

// Dans BeneficSection, modifiez l'import :
import dynamic from 'next/dynamic'

// Remplacer l'import statique par :
const FeaturesSectionDemo = dynamic(
  () => import('@/components/features-section-demo-3'),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />
  }
)

import { motion } from "framer-motion"



export const BeneficSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 my-25 md:my-50">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="uppercase font-bold text-2xl text-[#ffb74d] text-center"
        >
          BENEFICTS
        </motion.h2>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]"
        >
          Pourquoi Learnify change vraiment ta façon d’apprendre
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-md lg:text-lg text-center text-muted-foreground"
        >
          Des cours clairs, pratiques et accessibles, pensés pour t’aider à progresser vite et construire des compétences utiles
        </motion.p>


      </div>
      <div>
        <FeaturesSectionDemo />
      </div>

    </section>
  )
}
