import Image from "next/image";

export const DescriptionSection = () => {
  return (
    <div className="container mx-auto w-full px-4 sm:px-6 py-10 lg:py-12 lg:px-8 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-muted-foreground">
        C'est quoi{" "}
        <span className=" bg-linear-to-r from-[#feba46] via-[#ff8e3c] to-[#ff6b6b] bg-clip-text text-transparent tracking-tight">
          Learnify ?
        </span>
      </h1>
      <p className="max-w-3xl mx-auto text-muted-foreground text-center mt-5 mb-8 ">
        Learnify est une plateforme malagasy dédié à l'étudiant ou tous autre
        personne qui veulent apprendre des nouvelles choses, découvrir et permet
        également au apprenant de valoriser leur compétence et de partager leur
        compétence.
      </p>
      <div className="flex flex-col gap-6 items-center w-full  mx-auto lg:flex-row lg:w-fit">
        <div className="group relative overflow-hidden h-50 w-full lg:w-100 rounded-xl cursor-pointer">
          {/* Image */}

          <Image
            src="/prof.jpg"
            alt="professeur"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
          {/* Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center gap-3 px-4">
            <h1 className="text-white text-xl font-bold uppercase tracking-wide">
              Pour l'instructeur
            </h1>

            <button
              className="px-4 py-2 text-sm font-semibold text-white border border-white/70 rounded-full backdrop-blur-md transition-all duration-300
      hover:bg-white hover:text-black hover:scale-105"
            >
              Donnez des cours
            </button>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/30 transition" />
        </div>
        <div className="group relative h-50 w-full lg:w-75  overflow-hidden rounded-xl cursor-pointer">
          {/* Image */}
          <Image
            src="/student.png"
            alt="student"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient overlay (JAUNE) */}
          <div
            className="absolute inset-0 bg-linear-to-t 
    from-yellow-500/80 
    via-yellow-400/40 
    to-transparent 
    transition-opacity duration-500 
    group-hover:from-yellow-500/90"
          />

          {/* Content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center gap-3 px-4">
            <h1 className="text-white text-xl font-bold uppercase tracking-wide drop-shadow-md">
              Pour l'étudiant
            </h1>

            <button
              className="px-4 py-2 text-sm font-semibold text-white 
      border border-white/70 rounded-full 
      backdrop-blur-md transition-all duration-300
      hover:bg-white hover:text-yellow-600 hover:scale-105"
            >
              Commencer a apprendre
            </button>
          </div>

          {/* Glow effect (jaune subtil) */}
          <div
            className="absolute inset-0 rounded-xl 
    ring-1 ring-yellow-300/20 
    group-hover:ring-yellow-300/40 transition"
          />
        </div>
      </div>
    </div>
  );
};
