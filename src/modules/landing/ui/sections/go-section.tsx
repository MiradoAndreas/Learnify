import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { MacBookAndCourses } from "../components/macbook"
import Link from "next/link"


export const GoSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 gap-5 flex flex-col items-center gap-y-17">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="uppercase font-bold text-2xl text-[#ffb74d] text-center">let's go</h2>
        <h1 className="text-3xl font-bold md:text-4xl mt-6 mb-4 text-center text-[#202632]">
          Trouve tes futurs compétences aujourd'hui
        </h1>
        <p className="text-sm md:text-md lg:text-lg text-center text-muted-foreground">
          Aie accès à tous les cours disponibles sur Learnify, et apprends en un clic.
        </p>
        <Link href="/home">
          <InteractiveHoverButton className="mt-10">
            Commencez à apprendre
          </InteractiveHoverButton></Link>
      </div>
      <MacBookAndCourses />
    </section>
  )
}
