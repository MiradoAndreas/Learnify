import FooterDecoration from "./footer-decoration";
import { FooterLinks } from "./footer-links";
import { FooterLogo } from "./footer-logo";
import FooterNewsletter from "./footer-news-letter";
import { FooterSocial } from "./footer-social";

export function Footer() {
  return (
    <footer
      className="
      relative overflow-hidden px-5 md:px-10 lg:px-15
      bg-linear-to-b from-white to-gray-50
      dark:from-gray-900 dark:to-gray-950
      border-t border-gray-200 dark:border-gray-800
      mt-20
    "
    >
      <FooterDecoration />

      <div className="relative max-w-7xl mx-auto">
        {/* Contenu principal */}
        <div
          className="
          px-4 sm:px-6 lg:px-8
          py-12 md:py-16 lg:py-20
        "
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Logo et description */}
            <div className="lg:col-span-4">
              <FooterLogo />
            </div>

            {/* Liens rapides */}
            <div className="lg:col-span-8">
              <FooterLinks />
            </div>
          </div>

          {/* Newsletter et réseaux sociaux */}
          <div
            className="
            grid grid-cols-1 lg:grid-cols-2
            gap-8 lg:gap-16
            mt-12 lg:mt-20
          "
          >
            <FooterNewsletter />
            <FooterSocial />
          </div>
        </div>
      </div>
    </footer>
  );
}
