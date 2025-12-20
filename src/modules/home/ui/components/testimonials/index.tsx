"use client";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "Learnify m'a permis d'apprendre d'avantage et de pratiquer pour maximiser mes compétences notament en physique",
      name: "Nasandratra Rakotomamonjy",
      designation: "Étudiante à l'université Ankatso",
      src: "/testimonials/nasandratra.jpg",
    },
    {
      quote:
        "J'ai appris l'entrepreunariat en seulement 3 mois, et learnify m'a debloqué tous les compétences que je veux toujours acquérir, merci beaucoup pour l'équipe et également au professeur",
      name: "Geneto Robson",
      designation: "Gestionnaire de projet et chef de projet",
      src: "/testimonials/geneto.jpg",
    },
    {
      quote:
        "J'ai jamais cru que la cybersecurité est un jeu d'enfant si on est groupé par des amis qui partage la même vision et avec des professeur experimenté",
      name: "Fanomezantsoa fabien",
      designation: "Etudiant à l'ENI Fianarantsoa",
      src: "/testimonials/fabien.jpg",
    },
    {
      quote:
        "J'ai toujours rêvé d'apprendre le développement web et le développement mobile, parrallèle avec ma passion.",
      name: "Mirado Vonjiniaina",
      designation: "Autodidacte en développement web et Freelanceur",
      src: "/testimonials/Mirado.jpg",
    },
    {
      quote:
        "Je vous recommande fortement Learnify, car les formations dedans sont très cool, personnellement j'ai kiffé",
      name: "Hery Tiavina",
      designation: "Etudiant à polytechnique Vontovorona ",
      src: "/testimonials/hery.jpg",
    },
  ];
  return (
    <div className="flex flex-col mx-auto w-full px-4 sm:px-6 py-10 lg:py-12 lg:px-8 items-center container">
      <h1 className="text-3xl md:text-4xl font-bold text-muted-foreground text-center text-">
        Temoignages
      </h1>
      <p className="text-muted-foreground/80 text-center mt-3 md:mt-5">
        Learnify possède plus de 10k de retour positive chez les étudiants et
        consomateurs mais également les professeurs.
        <br />
        Des nombreux étudiants et professeurs sont tellement ravis et veulent
        encore plus sur la plateforme
      </p>
      <AnimatedTestimonials testimonials={testimonials} />
    </div>
  );
}
