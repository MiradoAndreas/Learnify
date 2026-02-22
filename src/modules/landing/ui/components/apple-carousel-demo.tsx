"use client";

import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";
import { motion } from "framer-motion"

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">

      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="uppercase font-bold text-2xl text-[#ffb74d] text-center"
        >
          how it works
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]"
        >
          Apprendre sur Learnify, c’est simple, rapide et efficace
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-md lg:text-lg text-center text-muted-foreground"
        >
          Découvre comment Learnify t’accompagne, étape par étape, pour transformer tes ambitions en compétences concrètes.
        </motion.p>

      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Carousel items={cards} />
      </motion.div>
    </div>
  );
}



const data = [
  {
    category: "Découverte",
    title: "Explore des compétences sans limites",
    src: "https://plus.unsplash.com/premium_photo-1664372145591-f7cc308ff5da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVhcm58ZW58MHx8MHx8fDA%3D",
    content: (
      <p>
        Accède à une large bibliothèque de cours en tech, business, design,
        IA et bien plus. Sur Learnify, chaque compétence est pensée pour ton avenir.
      </p>
    ),
  },
  {
    category: "Langue",
    title: "Apprends en malagasy, comprends vraiment",
    src: "https://plus.unsplash.com/premium_photo-1666721922432-49f64a5db919?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFkYWdhc2NhcnxlbnwwfHwwfHx8MA%3D%3D",
    content: (
      <p>
        Des cours expliqués clairement en malagasy pour une compréhension
        rapide, naturelle et sans barrières linguistiques.
      </p>
    ),
  },
  {
    category: "Flexibilité",
    title: "Apprends à ton rythme, quand tu veux",
    src: "https://images.unsplash.com/photo-1526684185682-c7210ad1dace?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FsbSUyMHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D",
    content: (
      <p>
        Depuis ton téléphone ou ton ordinateur, avance à ton propre rythme
        et reprends exactement là où tu t’es arrêté.
      </p>
    ),
  },
  {
    category: "Paiement",
    title: "Paye facilement, sans carte bancaire",
    src: "https://plus.unsplash.com/premium_photo-1661765352605-6d3f5a80f286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHBob25lJTIwYW5kJTIwcGVyc29ufGVufDB8fDB8fHww",
    content: (
      <p>
        Paiement simple et sécurisé via Mobile Money : Telma, Orange ou Airtel.
        Aucun besoin de carte Visa.
      </p>
    ),
  },
  {
    category: "Expertise",
    title: "Des formations créées par des professionnels",
    src: "https://images.unsplash.com/photo-1587691592099-24045742c181?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRlYWNoZXJ8ZW58MHx8MHx8fDA%3D",
    content: (
      <p>
        Apprends avec des experts du terrain grâce à des cours pratiques,
        concrets et directement applicables.
      </p>
    ),
  },
  {
    category: "Résultats",
    title: "Transforme tes compétences en opportunités",
    src: "https://images.unsplash.com/photo-1603202662706-62ead3176b8f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29yayUyMHdvbWVuJTIwc21pbGV8ZW58MHx8MHx8fDA%3D",
    content: (
      <p>
        Développe des compétences utiles localement et internationalement,
        et ouvre la porte à de nouvelles opportunités professionnelles.
      </p>
    ),
  },
];
