"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateSectionButtonProps {
  onClick: () => void;
}

export const CreateSectionButton = ({ onClick }: CreateSectionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45] text-white shadow hover:shadow-md"
    >
      <Plus className="w-4 h-4 mr-2" />
      Ajouter une section
    </Button>
  );
};
