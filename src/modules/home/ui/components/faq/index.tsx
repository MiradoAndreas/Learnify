"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  HelpCircle,
  CreditCard,
  Smartphone,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    icon: GraduationCap,
    question: "Learnify est-il adapté aux débutants ?",
    answer:
      "Oui. Les cours sont structurés pour accompagner les débutants pas à pas, tout en offrant du contenu avancé.",
  },
  {
    icon: CreditCard,
    question: "Quels sont les moyens de paiement disponibles ?",
    answer:
      "Les paiements sont possibles via Mvola, Orange Money et Airtel Money, sans carte bancaire.",
  },
  {
    icon: Smartphone,
    question: "Puis-je utiliser Learnify sur mon téléphone ?",
    answer:
      "Oui. La plateforme est entièrement responsive et optimisée pour mobile, tablette et desktop.",
  },
  {
    icon: ShieldCheck,
    question: "Les paiements sont-ils sécurisés ?",
    answer:
      "Toutes les transactions sont chiffrées et traitées via des services sécurisés conformes aux standards.",
  },
  {
    icon: HelpCircle,
    question: "Dans quelle langue sont les cours ?",
    answer:
      "Les cours sont principalement en Malagasy pour garantir une compréhension maximale.",
  },
];

export function FaqAccordion() {
  return (
    <section className="relative py-10 md:py-15 lg:py-20 px-4">
      {/* Decorative blur */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent" />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-muted-foreground">
            Besoin <span className="text-[#ffa041]"> d’aide?</span>
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Voici les réponses aux questions les plus fréquentes concernant
            Learnify.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;

            return (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="
                  group rounded-xl border bg-background
                  transition-all duration-300
                  hover:border-primary/50
                "
              >
                <AccordionTrigger
                  className="
                    flex gap-4 px-5 py-4 text-left
                    hover:no-underline
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      mt-1 flex h-10 w-10 items-center justify-center
                      rounded-lg bg-primary/10 text-primary
                      transition group-data-[state=open]:bg-primary group-data-[state=open]:text-white
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Question */}
                  <span className="flex-1 text-base sm:text-lg font-medium">
                    {faq.question}
                  </span>
                </AccordionTrigger>

                <AccordionContent
                  className="
                    px-5 pb-5 pl-18
                    text-sm sm:text-base
                    text-muted-foreground
                    leading-relaxed
                  "
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
