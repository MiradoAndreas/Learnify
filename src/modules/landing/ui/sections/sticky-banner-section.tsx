import { StickyBanner } from "@/components/ui/sticky-banner";

export function StickyBannerDemo() {
  return (
    <div className="relative flex h-fit w-full flex-col overflow-y-auto">
      <StickyBanner className="bg-linear-to-b from-[#ffd699] via-[#ffb74d] to-[#f9a825] text-white font-bold shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_8px_24px_rgba(255,183,77,0.35)]">
        <p className="mx-0 max-w-[90%] text-white drop-shadow-md text-sm md:text-md">
          💳 <strong>Apprends sans carte bancaire</strong> — Paiement Mobile Money (Telma, Orange, Airtel).{" "}
          <a href="/courses" className="transition duration-200 hover:underline">
            Découvrir Learnify
          </a>
        </p>
      </StickyBanner>


    </div>
  );
}

