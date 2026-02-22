"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { WithSection } from "../components/with-section"
import { WithoutSection } from "../components/without-section"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export const ProblemSection = () => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imageSrc, setImageSrc] = useState("/capture-learnify2.png")

  // Éviter l'hydratation mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mettre à jour l'image quand le thème change
  useEffect(() => {
    if (mounted) {
      setImageSrc(resolvedTheme === 'dark'
        ? '/capture-learnify2-dark.png'
        : '/capture-learnify2.png')
    }
  }, [resolvedTheme, mounted])

  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17">
      {/* Header avec animation simple */}
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="uppercase font-bold text-2xl text-[#ffb74d] text-center"
        >
          Problem
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632] dark:text-white"
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
          Regarder des cours ne suffit plus. Sans pratique guidée et projets réels,
          il est difficile de transformer l&apos;apprentissage en résultats professionnels.
        </motion.p>
      </div>

      {/* Section avec comparaison */}
      <div className="flex flex-col w-full gap-y-10 py-5 md:py-10 px-4 bg-gray dark:bg-background">
        <div className="flex flex-col md:flex-row w-full gap-y-8 gap-x-12">
          <WithoutSection />
          <WithSection />
        </div>

        {/* Image avec animation simple et gestion du thème */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className="h-10 w-11/12 mx-auto gradient-halo-behind-image relative -mb-5" />

          {/* Version avec clé pour forcer le re-render au changement de thème */}
          {mounted ? (
            <Image
              key={imageSrc} // Force le re-render quand l'image change
              src={imageSrc}
              alt="capture"
              width={1200}
              height={500}
              className="rounded-[10px] lg:rounded-[20px] border-halo relative z-10"
            />
          ) : (
            // Version par défaut pendant le montage
            <Image
              src="/capture-learnify2.png"
              alt="capture"
              width={1200}
              height={500}
              className="rounded-[10px] lg:rounded-[20px] border-halo relative z-10"
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}