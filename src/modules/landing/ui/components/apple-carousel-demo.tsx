"use client";

import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">

      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="uppercase font-bold text-2xl text-[#ffb74d] text-center">
          how it works
        </h2>
        <h1 className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]">
          Apprendre sur Learnify, c’est simple, rapide et efficace
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-center text-muted-foreground">
          Découvre comment Learnify t’accompagne, étape par étape, pour transformer tes ambitions en compétences concrètes.
        </p>
      </div>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            <Image
              src="https://assets.aceternity.com/macbook.png"
              alt="Macbook mockup from Aceternity UI"
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            />
          </div>
        );
      })}
    </>
  );
};

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
