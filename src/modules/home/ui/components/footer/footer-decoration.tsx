// components/footer/FooterDecoration.tsx
export default function FooterDecoration() {
  return (
    <>
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cercles dégradés */}
        <div
          className="
          absolute -top-32 -left-32 w-64 h-64
          bg-linear-to-r from-primary/20 to-purple-500/20
          rounded-full blur-3xl
          animate-pulse
        "
        />
        <div
          className="
          absolute -bottom-32 -right-32 w-64 h-64
          bg-linear-to-r from-blue-500/20 to-cyan-500/20
          rounded-full blur-3xl
          animate-pulse
          animation-delay-1000
        "
        />

        {/* Grille subtile */}
        <div
          className="
          absolute inset-0
          bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]
          bg-size-[14px_24px]
          opacity-50
        "
        />

        {/* Points lumineux */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-2 h-2
              bg-primary rounded-full
              opacity-20
              animate-float
            `}
            style={{
              left: `${10 + i * 15}%`,
              bottom: `${5 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
