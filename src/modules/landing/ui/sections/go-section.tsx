"use client"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { MacBookAndCourses } from "../components/macbook"
import Link from "next/link"
import { motion } from "framer-motion"


export const GoSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17 bg-background">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="uppercase font-bold text-2xl text-[#ffb74d] text-center"
        >
          Let's go
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]"
        >
          Trouve tes futurs compétences aujourd'hui
        </motion.h1>

        <motion.div initial={{ opacity: 0, x: 500 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
          <Link href="/home">
            <InteractiveHoverButton className="mt-10">
              Commencez à apprendre
            </InteractiveHoverButton></Link>
        </motion.div>


      </div>
      <MacBookAndCourses />
    </section>
  )
}
