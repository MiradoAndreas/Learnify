import FeaturesSectionDemo from "@/components/features-section-demo-3"



export const BeneficSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 my-25 md:my-50">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="uppercase font-bold text-2xl text-[#ffb74d] text-center">BENEFICTS</h2>
        <h1 className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]">
          Pourquoi Learnify change vraiment ta façon d’apprendre
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-center text-muted-foreground">
          Des cours clairs, pratiques et accessibles, pensés pour t’aider à progresser vite et construire des compétences utiles.
        </p>
      </div>
      <div>
        <FeaturesSectionDemo />
      </div>

    </section>
  )
}
