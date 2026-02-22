// Footer.tsx (version avec animations)
"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FooterLink } from "./footer-link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { motion } from "framer-motion";

// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

// Variants pour les animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

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
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
      className="pt-16 z-100 relative pb-16 bg-background border-t border-border/40 dark:bg-gray-950/95"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Newsletter */}
        <motion.div
          variants={fadeUp}
          className="md:flex items-center justify-between gap-10"
        >
          <div className="max-w-xl">
            <motion.h3
              variants={fadeUp}
              className="text-foreground text-2xl font-bold"
            >
              Reçois des conseils utiles pour apprendre plus vite
            </motion.h3>
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.05 }}
              className="mt-2 text-muted-foreground"
            >
              Astuces, nouvelles formations et ressources gratuites directement
              dans ta boîte mail.
            </motion.p>
          </div>

          <motion.form
            variants={scaleIn}
            transition={{ delay: 0.1 }}
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 md:mt-0 flex gap-3"
          >
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Input
                type="email"
                required
                placeholder="Ton adresse email"
                className="w-full px-4 py-3 rounded-lg h-full bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <InteractiveHoverButton className="w-[230px] md:w-[300px]">
                S'inscrire
              </InteractiveHoverButton>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Navigation */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
        >
          {footerNavs.map((section, sectionIdx) => (
            <motion.ul
              key={section.label}
              variants={fadeUp}
              custom={sectionIdx}
              className="space-y-4"
            >
              <motion.h4
                variants={fadeUp}
                className="text-foreground font-semibold"
              >
                {section.label}
              </motion.h4>
              {section.items.map((item, itemIdx) => (
                <motion.li
                  key={item.name}
                  variants={fadeUp}
                  custom={sectionIdx * 10 + itemIdx}
                >
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div
          variants={fadeUp}
          className="mt-16 py-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm text-muted-foreground"
          >
            © {new Date().getFullYear()} Learnify. Apprendre aujourd’hui,
            réussir demain.
          </motion.p>

          <motion.div variants={scaleIn}>
            <FooterLink />
          </motion.div>
        </motion.div>

        {/* Theme Toggler */}
        <motion.div
          variants={scaleIn}
          className="flex items-center max-w-fit mx-auto gap-4 px-4 py-2 rounded-full bg-secondary/10 backdrop-blur-sm border border-border/30"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-mono tracking-wider uppercase text-muted-foreground/80"
          >
            <span className="mr-1">✦</span> Ambiance
          </motion.p>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <AnimatedThemeToggler className="text-foreground" />
          </motion.div>
        </motion.div>

        {/* Logo géant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-center uppercase mt-20 text-5xl md:text-9xl lg:text-[12rem] xl:text-[13rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-muted-foreground/20 via-muted-foreground/10 to-transparent dark:from-gray-800 dark:via-gray-800/50 dark:to-transparent inset-x-0 select-none pointer-events-none">
            Learnify
          </h1>
        </motion.div>
      </div>
    </motion.footer>
  );
};