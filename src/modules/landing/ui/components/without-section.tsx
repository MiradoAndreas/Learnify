import Image from "next/image";

const problems = [
  "Tu regardes des cours au hasard sans savoir quoi apprendre ni dans quel ordre",
  "Tu comprends les concepts, mais tu sais pas les appliquer dans des projets réels.",
  "Tu commences motivé, puis tu abandonnes après quelques vidéos.",
  "Tu passes des heures à chercher “la bonne ressource”.",
  "Tu as l’impression d’apprendre, mais tu ne sais pas vraiment ce que tu maîtrises.",
  "Tu n’as rien de concret à présenter dans ton portfolio.",
  "Tu apprends de manière irrégulière et désorganisée.",
  "Tu doutes de ton niveau et hésites à postuler ou te lancer.",
  "Tu apprends seul, sans feedback ni accompagnement."
];

export const WithoutSection = () => {
  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-md font-semibold text-center">
        Sans <span className="text-xl font-bold">Learnify</span>
      </h1>

      <div className="flex flex-col gap-y-3 md:gap-4">
        {problems.map((text, index) => (
          <div key={index} className="flex items-center">
            <Image
              src="/red-cross.svg"
              alt="red cross"
              width={30}
              height={30}
              className="mx-2"
            />
            <p className="text-md text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};