import { AnimatedTestimonialsDemo } from "../components/animated-testimonials-demo"


export const TestimonialSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="uppercase font-bold text-2xl text-[#ffb74d] text-center">TESTIMONIALS</h2>
        <h1 className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]">
          Des connaissances, mais pas de vraies compétences
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-center text-muted-foreground">
          Regarder des cours ne suffit plus. Sans pratique guidée et projets réels, il est difficile de transformer l’apprentissage en résultats professionnels.
        </p>
      </div>
      <AnimatedTestimonialsDemo />
    </section>
  )
}
