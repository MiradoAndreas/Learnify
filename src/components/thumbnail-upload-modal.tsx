import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

import { ResponsiveModal } from "./responsive-modal";

import { UploadDropzone } from "@/lib/uploadthing";

interface ThumbnailUploadModalProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const ThumbnailUploadModal = ({
  courseId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const onUploadComplete = () => {
    onOpenChange(false);
    queryClient.invalidateQueries({
      queryKey: trpc.teacher.getCourseDetails.queryKey({ id: courseId }),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.teacher.getMyCourses.queryKey(),
    });
  };
  return (
    <ResponsiveModal
      title="Charger ici votre miniature"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ courseId }}
        onClientUploadComplete={onUploadComplete}
        onUploadError={(error) => {}}
      />
    </ResponsiveModal>
  );
};
