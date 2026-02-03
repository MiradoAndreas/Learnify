import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import Link from "next/link";

const caseUsages = [
  {
    title: "Apprendre efficacement",
    description: "Des parcours clairs et des projets concrets.",
  },
  {
    title: "Devenir employable",
    description: "Un portfolio solide et des compétences validées.",
  },
  {
    title: "Monétiser son expertise",
    description: "Publie tes cours et génère des revenus.",
  },
];

export const CaseUsage = () => {
  return (
    <section className="flex flex-col">
      <h2 className="uppercase text-sm font-extrabold text-muted-foreground">
        Cas d’usage
      </h2>

      <div className="mt-8 mb-10 flex flex-col gap-y-9">
        {caseUsages.map((item) => (
          <div key={item.title} className="flex flex-col gap-y-4">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-md font-medium text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <Link href="/blog">
        <InteractiveHoverButton>
          Voir tous les cas d’usage
        </InteractiveHoverButton>
      </Link>
    </section>
  );
};
