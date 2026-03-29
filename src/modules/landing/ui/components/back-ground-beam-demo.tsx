"use client";
import { BackgroundBeams } from "@/components/ui/background-beams";

import { OtherQuestion } from "./other-question";


export function BackgroundBeamsDemo() {
  return (
    <div className="w-full rounded-md bg-neutral-950 relative  antialiased">
      <div className="max-w-4xl mx-auto p-4">
        <OtherQuestion />
      </div>
      <BackgroundBeams />
    </div>
  );
}
