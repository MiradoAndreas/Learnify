"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudioUploader } from "./lesson-uploader";

interface LessonUploadModalProps {
  courseId: string;
  sectionId: string;
}

export const LessonUploadModal = ({
  courseId,
  sectionId,
}: LessonUploadModalProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const create = useMutation(
    trpc.teacher.createLessonUpload.mutationOptions({
      onSuccess: () => {
        toast.success("Video created");
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getAllLessonByCourseId.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const onSuccess = () => {
    toast.success("Lesson created successfully");
    if (!create.data?.lesson.id) return;

    create.reset();
    router.push(
      `/teacher/courses/${courseId}/lessons/${create.data.lesson.id}`
    );
  };
  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data?.url}
        onOpenChange={() => {
          create.reset();
        }}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
        ) : (
          <Spinner />
        )}
      </ResponsiveModal>
      <Button
        variant="secondary"
        onClick={() => create.mutate({ sectionId })}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <>
            <Spinner />
          </>
        ) : (
          <>
            <PlusIcon />
          </>
        )}
        Create Lesson for this section
      </Button>
    </>
  );
};
