// components/footer/FooterSocial.tsx
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Youtube,
  Facebook,
  MessageSquare,
  Globe,
} from "lucide-react";

const socialLinks = [
  {
    name: "Twitter",
    icon: <Twitter className="w-5 h-5" />,
    href: "#",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="w-5 h-5" />,
    href: "#",
    color: "from-blue-600 to-blue-800",
    bgColor: "bg-blue-600/10",
  },
  {
    name: "GitHub",
    icon: <Github className="w-5 h-5" />,
    href: "#",
    color: "from-gray-700 to-gray-900",
    bgColor: "bg-gray-700/10",
  },
  {
    name: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    href: "#",
    color: "from-pink-500 to-purple-600",
    bgColor: "bg-pink-500/10",
  },
  {
    name: "YouTube",
    icon: <Youtube className="w-5 h-5" />,
    href: "#",
    color: "from-red-500 to-red-700",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Facebook",
    icon: <Facebook className="w-5 h-5" />,
    href: "#",
    color: "from-blue-600 to-blue-800",
    bgColor: "bg-blue-600/10",
  },
  {
    name: "Discord",
    icon: <MessageSquare className="w-5 h-5" />,
    href: "#",
    color: "from-purple-500 to-purple-700",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Site Web",
    icon: <Globe className="w-5 h-5" />,
    href: "#",
    color: "from-green-500 to-green-700",
    bgColor: "bg-green-500/10",
  },
];

export function FooterSocial() {
  return (
    <div className="space-y-6">
      <div>
        <h3
          className="
          text-lg font-bold mb-4
          text-gray-900 dark:text-white
        "
        >
          Suivez-nous
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Rejoignez notre communauté de développeurs et créateurs
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.href}
            className={`
              group relative
              p-3 rounded-xl
              ${social.bgColor}
              border border-gray-200 dark:border-gray-700
              hover:border-transparent
              transition-all duration-300
              hover:shadow-lg
            `}
            aria-label={social.name}
          >
            <div
              className="
              absolute inset-0
              bg-linear-to-br ${social.color}
              opacity-0 group-hover:opacity-10
              rounded-xl
              transition-opacity duration-300
            "
            />

            <div
              className={`
              relative
              flex items-center justify-center
              text-gray-600 dark:text-gray-300
              group-hover:text-gray-900 dark:group-hover:text-white
              transition-colors duration-300
            `}
            >
              {social.icon}
            </div>

            <div
              className="
              absolute -bottom-10 left-1/2 transform -translate-x-1/2
              px-2 py-1
              bg-gray-900 text-white text-xs
              rounded-md
              opacity-0 group-hover:opacity-100
              transition-all duration-300
              whitespace-nowrap
              z-10
            "
            >
              {social.name}
              <div
                className="
                absolute -top-1 left-1/2 transform -translate-x-1/2
                w-2 h-2 bg-gray-900 rotate-45
              "
              />
            </div>
          </a>
        ))}
      </div>

      <div
        className="
        flex flex-wrap items-center gap-4
        pt-4 border-t border-gray-200 dark:border-gray-700
      "
      >
        <div className="flex items-center gap-2">
          <div
            className="
            w-8 h-8 rounded-full
            bg-linear-to-r from-green-500 to-emerald-400
            flex items-center justify-center
          "
          >
            <span className="text-white text-sm font-bold">MG</span>
          </div>
          <span className="text-gray-700 dark:text-gray-300">Madagascar</span>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-2">
          <div
            className="
            w-2 h-2 rounded-full
            bg-green-500 animate-pulse
          "
          />
          <span className="text-green-600 dark:text-green-400 font-medium">
            Support en ligne
          </span>
        </div>
      </div>
    </div>
  );
}
