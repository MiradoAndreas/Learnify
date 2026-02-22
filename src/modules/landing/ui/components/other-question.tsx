import { AccordionDemo } from "./accordion-demo"
import { motion } from "framer-motion"

const appleEasing = [0.16, 1, 0.3, 1] as const;

export const OtherQuestion = () => {
  return (
    <div className="py-20 md:py-30">

      <div className="p-4 flex flex-col gap-5">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: appleEasing }}
          className="relative z-10 text-4xl md:text-7xl bg-clip-text text-transparent bg-linear-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold"
        >
          FAQ
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: appleEasing }}
          className="text-[#929292] text-center text-xl md:text-2xl"
        >
          Autre Questions sur Learnify ?
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: appleEasing }}
          className="z-10"
        >
          <AccordionDemo />
        </motion.div>
      </div>

    </div>


  )
}
