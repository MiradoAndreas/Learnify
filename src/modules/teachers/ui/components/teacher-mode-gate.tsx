"use client";

import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

export const TeacherModeButton = () => {
  const router = useRouter();
  const trpc = useTRPC();

 
  const {refetch, isFetching} = useQuery(
    trpc.teacher.getTeacherRedirect.queryOptions(undefined, {
      enabled: false
    })
  )

  const onClick = async () => {
    const res = await refetch();
    if (res.data?.redirectTo) {
      router.push(res.data.redirectTo);
    }
  };

  return (
    <Button onClick={onClick} disabled={isFetching}>
      {isFetching ? <Spinner /> : <UserCog />}
      {isFetching ? "Vérification..." : "Teacher mode"}
    </Button>
  );
};
