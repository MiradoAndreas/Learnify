// components/footer/FooterLinks.tsx
import { ArrowRight, Zap, Palette, Code, Shield, Globe } from "lucide-react";

const linkGroups = [
  {
    title: "Compétences",
    icon: <Zap className="w-5 h-5" />,
    links: [
      { name: "Developpement web", href: "#" },
      { name: "Certifications informatiques", href: "#" },
      { name: "Certifications par compétence", href: "#" },
      { name: "Sicence de données", href: "#" },
      { name: "Communication", href: "#" },
    ],
  },
  {
    title: "Découvrir Learnify",
    icon: <Palette className="w-5 h-5" />,
    links: [
      { name: "Télécharger l'application", href: "#" },
      { name: "Enseigner sur Learnify", href: "#" },
      { name: "Abonnement et tarifs", href: "#" },
      { name: "Affilié", href: "#" },
      { name: "Aide et support", href: "#" },
    ],
  },
  {
    title: "A propos",
    icon: <Code className="w-5 h-5" />,
    links: [
      { name: "A props de Learnify", href: "#" },
      { name: "Carrières", href: "#" },
      { name: "Contactez-nous", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Investisseurs", href: "#" },
    ],
  },
  {
    title: "Juridique et accécibilité",
    icon: <Globe className="w-5 h-5" />,
    links: [
      { name: "Déclaration d'accebilité", href: "#" },
      { name: "Politique", href: "#" },
      { name: "Plan du site", href: "#" },
      { name: "Condition", href: "#" },
    ],
  },
];

export function FooterLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      {linkGroups.map((group, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="
              p-2 rounded-lg
              bg-linear-to-br from-primary/10 to-primary/5
              text-primary
            "
            >
              {group.icon}
            </div>
            <h3
              className="
              text-lg font-bold
              text-gray-900 dark:text-white
            "
            >
              {group.title}
            </h3>
          </div>

          <ul className="space-y-3">
            {group.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <a
                  href={link.href}
                  className="
                    group flex items-center gap-2
                    text-gray-600 dark:text-gray-300
                    hover:text-primary dark:hover:text-primary
                    transition-all duration-300
                  "
                >
                  <ArrowRight
                    className="
                    w-4 h-4 opacity-0 -translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-300
                  "
                  />
                  <span
                    className="
                    border-b border-transparent
                    group-hover:border-primary/30
                    transition-all duration-300
                  "
                  >
                    {link.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
