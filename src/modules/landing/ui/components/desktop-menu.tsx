"use client";

import { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { Solution } from "./solution";
import { CaseUsage } from "./case-usage";
import Link from "next/link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";


export function DesktopMenu() {
  const [active, setActive] = useState<string | null>(null);
  

  return (
    <Menu setActive={setActive}>
      <MenuItem setActive={setActive} active={active} item="Competences">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6 p-4 text-sm">
            <HoveredLink href="/web-dev">• Développement</HoveredLink>
            <HoveredLink href="/interface-design">• Business </HoveredLink>
            <HoveredLink href="/seo">• Finance et comptabilité</HoveredLink>
            <HoveredLink href="/branding">• Informatique et logiciels</HoveredLink>
            <HoveredLink href="/web-dev">• Productivité bureautique</HoveredLink>
            <HoveredLink href="/interface-design">• Développement personnel </HoveredLink>
            <HoveredLink href="/seo">• Design</HoveredLink>
            <HoveredLink href="/branding">• Marketing</HoveredLink>
          </div>

          <div className="mt-7 mb-2 max-w-fit mx-auto">
            <Link href="all-comptences" className="max-w-fit mx-auto">
              <InteractiveHoverButton>
                Voir tous les compétences
              </InteractiveHoverButton>
            </Link>
          </div>
        </div>
      </MenuItem>

      <MenuItem setActive={setActive} active={active} item="Products">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6 p-4 text-sm">

            <ProductItem
              title="Career Paths"
              href="/paths"
              src="/career.svg"
              description="Des parcours clairs pour devenir développeur, designer ou data analyst — même en partant de zéro."
            />

            <ProductItem
              title="Interactive Courses"
              href="/courses"
              src="/mentor.svg"
              description="Apprends en pratiquant. Projets réels, défis, feedback instantané."
            />

            <ProductItem
              title="Mentorship"
              href="/mentors"
              src="/sharing.svg"
              description="Des experts de l’industrie pour te guider, corriger et accélérer ta progression."
            />

            <ProductItem
              title="Job-Ready Program"
              href="/job-ready"
              src="/job.svg"
              description="Portfolio, CV, simulations d’entretien — tout pour décrocher ton premier job."
            />

          </div>
        </div>
      </MenuItem>


      <MenuItem setActive={setActive} active={active} item="Services">
        <div className="grid grid-cols-2 text-sm max-w-3xl ">
          {/* <HoveredLink href="/pricing/basic">Basic</HoveredLink>
          <HoveredLink href="/pricing/pro">Pro</HoveredLink>
          <HoveredLink href="/pricing/team">Team</HoveredLink> */}
          <div className="p-8">
            <Solution />
          </div>
          <div className="bg-gray-50 p-8">
            <CaseUsage />
          </div>
        </div>
      </MenuItem>
    </Menu>
  );
}
