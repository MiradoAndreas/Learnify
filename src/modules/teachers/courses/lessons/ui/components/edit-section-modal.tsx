"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

interface EditSectionModalProps {
  section: {
    id: string;
    title: string;
  };
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditSectionModal = ({
  section,
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: EditSectionModalProps) => {
  const trpc = useTRPC();
  const [title, setTitle] = useState(section.title);

  const updateSectionMutation = useMutation(
    trpc.teacher.updateSection.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message || "Section mise à jour avec succès");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        toast.error(
          error.message || "Une erreur est survenue lors de la mise à jour"
        );
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    await updateSectionMutation.mutateAsync({
      sectionId: section.id,
      title: title.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Modifier la section
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre section. Cliquez sur
              enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Introduction au cours"
                disabled={updateSectionMutation.isPending}
                className="focus:ring-[#feba45] focus:border-[#feba45]"
              />
              <p className="text-xs text-gray-500">
                Le titre apparaîtra dans la structure du cours
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSectionMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateSectionMutation.isPending || !title.trim()}
              className="bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45]"
            >
              {updateSectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
