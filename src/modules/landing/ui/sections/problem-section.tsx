import Image from "next/image"
import { WithSection } from "../components/with-section"
import { WithoutSection } from "../components/without-section"


export const ProblemSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="uppercase font-bold text-2xl text-[#ffb74d] text-center">Problem</h2>
        <h1 className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]">
          Des connaissances, mais pas de vraies compétences
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-center text-muted-foreground">
          Regarder des cours ne suffit plus. Sans pratique guidée et projets réels, il est difficile de transformer l’apprentissage en résultats professionnels.
        </p>
      </div>
      <div className="flex flex-col w-full gap-y-10 py-5 md:py-10 px-4 bg-gray-50">

        <div className="flex flex-col md:flex-row w-full gap-y-8 gap-x-12">
          <div className="w-full md:min-w-1/2">
            <WithoutSection />
          </div>
          <div className="w-full md:min-w-w-1/2">
            <WithSection />
          </div>
        </div>
        <div>
          <div className="h-10 w-11/12 mx-auto gradient-halo-behind-image relative -mb-5">

          </div>
          <Image src="/capture-learnify2.png" alt="capture" width={1200} height={500} className="rounded-[10px] lg:rounded-[20px] border-halo relative z-10" />
        </div>
      </div>
    </section>
  )
}
