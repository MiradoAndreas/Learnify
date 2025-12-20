// components/footer/FooterLogo.tsx
import Link from "next/link";

import Logo from "../navbar/Logo";

export function FooterLogo() {
  return (
    <div className="space-y-6">
      <Logo />

      <p
        className="
        text-gray-600 dark:text-gray-300
        max-w-sm
        leading-relaxed
      "
      >
        Nous créons des expériences digitales exceptionnelles qui transforment
        les idées en réalité.
      </p>
    </div>
  );
}
