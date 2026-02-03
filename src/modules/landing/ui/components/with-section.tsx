import Image from "next/image";



export const WithSection = () => {
  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-md font-semibold text-center">
        Avec <span className="text-xl font-bold">Learnify</span>
      </h1>

      <div>
        {/* 1 ere ligne  */}
        <div className="flex">
          {/* Card  */}
          <div className="bg-card max-w-[280px]  text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit translate-x-4 ">
            <div className="flex items-center gap-x-1.5">
              <Image
                src="/check.svg"
                alt="check"
                width={20}
                height={20}
                className=""
              />
              <h3 className="text-green-400 font-semibold text-balance">
                Cours combiné  théroie et pratique
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Tu pratiques immédiatement avec des exercices et des projets concrets guidés.</p>
            </div>
          </div>
          {/* Card  */}
          <div className="bg-card max-w-[280px]  text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-[-15deg]">
            <div className="flex items-center gap-x-1.5">
              <Image
                src="/check.svg"
                alt="check"
                width={20}
                height={20}
                className=""
              />
              <h3 className="text-green-400 font-semibold text-balance">
                Progression claire et structurée
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Chaque étape est logique, tu sais toujours quoi apprendre ensuite.</p>
            </div>
          </div>
        </div>
        {/* 2 derniere ligne  */}
        <div className="max-w-fit mx-auto">
          <div className="bg-card max-w-[280px]  text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-20">
            <div className="flex items-center gap-x-1.5">
              <Image
                src="/check.svg"
                alt="check"
                width={20}
                height={20}
                className=""
              />
              <h3 className="text-green-400 font-semibold text-balance">
                Motivation constante
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Tu avances avec des objectifs clairs et un sentiment constant de progression.</p>
            </div>
          </div>
        </div>
        {/* 3 derniere ligne  */}
        <div className="flex">
          {/* Card  */}
          <div className="bg-card max-w-[280px]  text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit">
            <div className="flex items-center gap-x-1.5">
              <Image
                src="/check.svg"
                alt="check"
                width={20}
                height={20}
                className=""
              />
              <h3 className="text-green-400 font-semibold text-balance">
                Portfolio concret
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Construis des projets réels que tu peux montrer fièrement.</p>
            </div>
          </div>
          {/* Card  */}
          <div className="bg-card max-w-[280px]  text-card-foreground rounded-xl border-accent shadow-2xl flex flex-col items-start p-4 transform transition duration-300 h-fit rotate-[-20deg]">
            <div className="flex items-center gap-x-1.5">
              <Image
                src="/check.svg"
                alt="check"
                width={20}
                height={20}
                className=""
              />
              <h3 className="text-green-400 font-semibold text-balance">
                Cours en malagasy
              </h3>
            </div>
            <div>
              <p className="text-md text-muted-foreground">Comprends directement, sans traduire.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};