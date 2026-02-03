import { AccordionDemo } from "./accordion-demo"


export const OtherQuestion = () => {
  return (
    <div className="py-20 md:py-30">

      <div className="p-4 flex flex-col gap-5">
        <h1 className="relative z-10 text-4xl md:text-7xl  bg-clip-text text-transparent bg-linear-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          FAQ
        </h1>
        <p className="text-[#929292] text-center text-xl md:text-2xl">
          Autre Questions sur Learnify ?
        </p>
        <AccordionDemo />
      </div>

    </div>


  )
}
