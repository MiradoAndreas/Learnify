"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { lessonCommentInsertSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  courseId: string;
  lessonId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

const commentFormSchema = lessonCommentInsertSchema
  .omit({ userId: true, lessonId: true })
  .extend({
    content: z.string().min(1, "Le commentaire ne peut pas être vide"),
  });

export const CommentForm = ({
  courseId,
  lessonId,
  onSuccess,
  onCancel,
  parentId,
  variant = "comment",
}: CommentFormProps) => {
  const trpc = useTRPC();
  // const { user } = useUser();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const create = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: () => {
        // Invalider les queries pour rafraîchir les commentaires
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryKey({
            courseId,
            lessonId,
          }),
        });

        if (parentId) {
          queryClient.invalidateQueries({
            queryKey: trpc.comments.getMany.infiniteQueryKey({
              courseId,
              lessonId,
              parentId,
            }),
          });
        }

        form.reset();
        toast.success(variant === "reply" ? "Réponse ajoutée" : "Commentaire ajouté");
        onSuccess?.();
      },
      onError: () => {
        toast.error("Une erreur est survenue");
      },
    })
  );

  const handleSubmit = (values: z.infer<typeof commentFormSchema>) => {
    create.mutate({
      courseId,
      lessonId,
      parentId,
      content: values.content,
    });
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {/* <UserAvatar
          size={variant === "comment" ? "lg" : "sm"}
          imageUrl={user?.imageUrl || "/assets/user-placeholder.svg"}
          name={user?.fullName || "User"}
        /> */}
        <div className="flex-1">
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={
                      variant === "reply"
                        ? "Répondre à ce commentaire..."
                        : "Ajouter un commentaire..."
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0 h-17"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={handleCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending && <Spinner className="mr-1 size-4" />}
              {variant === "reply" ? "Répondre" : "Commenter"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};