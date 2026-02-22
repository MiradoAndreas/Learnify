import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { motion } from "framer-motion"

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "Learnify m’a enfin permis de comprendre des concepts techniques sans stress. Le fait d’apprendre en malagasy change tout.",
      name: "Andry R.",
      designation: "Étudiant en informatique",
      src: "https://images.unsplash.com/photo-1564564244660-5d73c057f2d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3V5fGVufDB8fDB8fHww",
    },
    {
      quote:
        "J’ai pu apprendre à mon rythme et appliquer directement ce que j’ai appris sur de vrais projets. Très pratique.",
      name: "Mickaël T.",
      designation: "Freelance junior",
      src: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z3V5fGVufDB8fDB8fHww",
    },
    {
      quote:
        "Le paiement par Mobile Money m’a vraiment facilité l’accès aux formations. Pas besoin de carte bancaire.",
      name: "Sahondra L.",
      designation: "Étudiante",
      src: "https://plus.unsplash.com/premium_photo-1669704099116-a325b4d6186f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2lybCUyMHNtaWxlfGVufDB8fDB8fHww",
    },
    {
      quote:
        "Les cours sont clairs, bien structurés et orientés vers des compétences utiles pour le marché du travail.",
      name: "Tojo M.",
      designation: "Auto-entrepreneur",
      src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGd1eXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      quote:
        "Learnify m’a redonné confiance en ma capacité d’apprendre et de progresser dans la tech.",
      name: "Aina K.",
      designation: "Débutante en développement",
      src: "https://plus.unsplash.com/premium_photo-1705847870719-b4639d2f3d5c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGdpcmwlMjBzbWlsZXxlbnwwfHwwfHx8MA%3D%3D",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
    </motion.div>
  )
}