"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FooterLink } from "./footer-link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";


export const Footer = () => {
  const footerNavs = [
    {
      label: "Learnify",
      items: [
        { href: "/about", name: "À propos de Learnify" },
        { href: "/how-it-works", name: "Comment ça marche" },
        { href: "/pricing", name: "Tarifs" },
        { href: "/contact", name: "Contact" },
      ],
    },
    {
      label: "Formations",
      items: [
        { href: "/courses", name: "Tous les cours" },
        { href: "/categories/tech", name: "Tech & Développement" },
        { href: "/categories/business", name: "Business & Freelance" },
        { href: "/categories/design", name: "Design & Créatif" },
      ],
    },
    {
      label: "Ressources",
      items: [
        { href: "/blog", name: "Blog & Conseils" },
        { href: "/free-videos", name: "Vidéos gratuites" },
        { href: "/faq", name: "FAQ" },
        { href: "/support", name: "Support" },
      ],
    },
    {
      label: "Légal",
      items: [
        { href: "/terms", name: "Conditions d’utilisation" },
        { href: "/privacy", name: "Politique de confidentialité" },
        { href: "/payments", name: "Paiements Mobile Money" },
      ],
    },
  ];

  return (
    <footer className="pt-16 z-100 relative  pb-16 bg-[#202632] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Newsletter */}
        <div className="md:flex items-center justify-between gap-10">
          <div className="max-w-xl">
            <h3 className="text-white text-2xl font-bold">
              Reçois des conseils utiles pour apprendre plus vite
            </h3>
            <p className="mt-2 text-gray-400">
              Astuces, nouvelles formations et ressources gratuites directement
              dans ta boîte mail.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 md:mt-0 flex gap-3"
          >
            <Input
              type="email"
              required
              placeholder="Ton adresse email"
              className="w-full px-4 py-3 rounded-lg h-full"
            />
            <InteractiveHoverButton className="w-[230px] md:w-[300px]">
              S'inscrire
            </InteractiveHoverButton>
          </form>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {footerNavs.map((section) => (
            <ul key={section.label} className="space-y-4">
              <h4 className="text-white font-semibold">
                {section.label}
              </h4>
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Learnify. Apprendre aujourd’hui,
            réussir demain.
          </p>

          <FooterLink />
        </div>
        <div>
          <h1 className="text-center uppercase mt-20 text-5xl md:text-9xl lg:text-[12rem] xl:text-[13rem] font-bold bg-clip-text text-transparent bg-linear-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
            Learnify
          </h1>
        </div>
      </div>
    </footer>
  );
};
