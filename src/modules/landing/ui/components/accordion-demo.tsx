"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// 1. Centralisation des données pour un code plus propre
const FAQ_ITEMS = [
  {
    value: "free-courses",
    question: "Les cours sur Learnify sont-ils vraiment gratuits ?",
    answer:
      "Oui. Learnify propose une sélection de cours 100 % gratuits pour te permettre de découvrir la plateforme, apprendre sans risque et monter en compétences dès maintenant."
  },
  {
    value: "who-can-learn",
    question: "À qui s’adresse Learnify ?",
    answer:
      "Learnify est conçue pour les étudiants, débutants, professionnels et autodidactes qui veulent acquérir des compétences concrètes, utiles localement et à l’international."
  },
  {
    value: "quality",
    question: "Quelle est la qualité des formations ?",
    answer:
      "Chaque cours est créé par des professionnels du terrain. Le contenu est pratique, structuré et orienté vers des compétences réellement applicables."
  },
  {
    value: "language",
    question: "Dans quelle langue sont les cours ?",
    answer:
      "Learnify propose des cours en malagasy, français et anglais afin de garantir une compréhension claire et accessible à tous."
  },
  {
    value: "pace",
    question: "Puis-je apprendre à mon propre rythme ?",
    answer:
      "Absolument. Tu peux suivre les cours quand tu veux, depuis ton téléphone ou ton ordinateur, et reprendre exactement là où tu t’es arrêté."
  },
  {
    value: "certificate",
    question: "Est-ce que Learnify délivre des certificats ?",
    answer:
      "Oui. Certains cours offrent un certificat de complétion que tu peux ajouter à ton CV ou partager sur tes réseaux professionnels."
  },
  {
    value: "payment",
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "Learnify accepte les paiements via Mobile Money (Telma, Orange, Airtel). Aucun besoin de carte bancaire."
  },
  {
    value: "pricing",
    question: "Les cours payants sont-ils abordables ?",
    answer:
      "Oui. Les prix sont pensés pour être accessibles tout en garantissant un contenu de qualité professionnelle."
  },
  {
    value: "career",
    question: "Learnify peut-il m’aider à trouver un emploi ?",
    answer:
      "Learnify te donne les compétences recherchées par le marché. Beaucoup de nos apprenants utilisent ces compétences pour décrocher des opportunités professionnelles."
  },
  {
    value: "support",
    question: "Comment contacter l’équipe Learnify ?",
    answer:
      "Notre équipe est disponible pour t’accompagner. Tu peux nous contacter directement depuis la plateforme et nous te répondrons rapidement."
  }
]


export function AccordionDemo() {
  return (
    <div className="w-full max-w-4xl mx-auto py-10 z-50">

      <Accordion type="multiple" className="w-full space-y-3">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="border border-white/10 bg-white/5 rounded-lg px-4 transition-all hover:bg-white/8"
          >
            <AccordionTrigger className="font-medium text-white hover:no-underline py-4 text-lg md:text-xl">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className=" pb-6 text-md md:text-lg leading-relaxed text-zinc-400">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>


      {/* <Accordion
        type="multiple"


        className="w-full space-y-2 z-50"
      >
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="border border-white/10 bg-white/5 rounded-lg px-4 transition-all hover:bg-white/8"
          >
            <AccordionTrigger className="text-sm font-medium text-white hover:no-underline py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-zinc-400 leading-relaxed pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion> */}
    </div>
  )
}