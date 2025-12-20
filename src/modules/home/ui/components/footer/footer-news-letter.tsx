// components/footer/FooterNewsletter.tsx
"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div
      className="
      relative overflow-hidden
      bg-linear-to-br from-gray-50 to-white
      dark:from-gray-900/50 dark:to-gray-800/30
      rounded-2xl p-6 md:p-8
      border border-gray-200 dark:border-gray-700
      shadow-xl
    "
    >
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div
          className="
          absolute inset-0
          bg-linear-to-br from-primary/10 to-transparent
          rounded-full blur-3xl
        "
        />
      </div>

      <div className="relative">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="
            p-3 rounded-xl
            bg-linear-to-br from-primary to-primary/80
            shadow-lg shadow-primary/20
          "
          >
            <Mail className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3
              className="
              text-xl font-bold
              text-gray-900 dark:text-white
              mb-2
            "
            >
              Restez informé
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recevez nos dernières nouveautés et offres exclusives
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="
                w-full px-5 py-3 pl-12
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-600
                rounded-xl
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary
                focus:border-transparent
                transition-all duration-300
              "
              required
            />
            <Mail
              className="
              absolute left-4 top-1/2 transform -translate-y-1/2
              w-5 h-5 text-gray-400
            "
            />
          </div>

          <button
            type="submit"
            disabled={isSubscribed}
            className="
              w-full
              px-6 py-3
              bg-linear-to-r from-primary to-primary/90
              text-white font-semibold
              rounded-xl
              flex items-center justify-center gap-2
              hover:shadow-lg hover:shadow-primary/30
              disabled:opacity-70
              transition-all duration-300
            "
          >
            {isSubscribed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Inscrit avec succès !
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                S'abonner
              </>
            )}
          </button>
        </form>

        <p
          className="
          mt-4 text-sm text-gray-500 dark:text-gray-400
          text-center
        "
        >
          En vous inscrivant, vous acceptez notre{" "}
          <a
            href="#"
            className="
            text-primary hover:underline
            transition-colors duration-300
          "
          >
            politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
}
