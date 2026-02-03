"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface CreateSectionModalProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSectionModal = ({
  courseId,
  open,
  onOpenChange,
}: CreateSectionModalProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const createSection = useMutation(
    trpc.teacher.createSection.mutationOptions({
      onSuccess: () => {
        toast.success("Section créée");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey({ courseId }),
        });
        setTitle("");
        onOpenChange(false);
      },
    })
  );

  return (
    <ResponsiveModal
      title="Create section"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-4 m-5">
        <Input
          placeholder="Section title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Button
          onClick={() =>
            createSection.mutate({
              courseId,
              title,
            })
          }
          disabled={!title || createSection.isPending}
          className="w-full bg-linear-to-r from-[#feba45] to-[#ff9e1f] hover:from-[#ff9e1f] hover:to-[#feba45]"
        >
          Create section
        </Button>
      </div>
    </ResponsiveModal>
  );
};
