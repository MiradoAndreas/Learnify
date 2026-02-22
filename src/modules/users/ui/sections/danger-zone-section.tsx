"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangleIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export const DangerZoneSection = () => {
  const trpc = useTRPC();
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient()

  const deleteMutation = useMutation(
    trpc.user.deleteAccount.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.user.getProfile.queryKey()
        });
        toast.success("Compte supprimé avec succès", {
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "none",
          },
        });
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Une erreur est survenue");
        setIsDeleting(false);
      }
    })
  );

  const handleDeleteAccount = () => {
    if (confirmation !== "SUPPRIMER MON COMPTE") {
      toast.error("Veuillez taper exactement 'SUPPRIMER MON COMPTE'", {
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "none",
        },
      });
      return;
    }

    setIsDeleting(true);
    deleteMutation.mutate({ confirmation });
  };

  return (
    <Card className="border border-destructive/30 dark:border-destructive/50 bg-card">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangleIcon className="h-5 w-5" />
          Zone de danger
        </CardTitle>
        <CardDescription className="text-destructive/80 dark:text-destructive/70">
          Actions irréversibles. Soyez certain de ce que vous faites.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-destructive dark:text-destructive/90">
              Supprimer le compte
            </h3>
            <p className="text-sm text-muted-foreground">
              Cette action supprime définitivement votre compte et toutes vos données.
              Elle est irréversible. Veuillez taper{" "}
              <span className="font-bold text-destructive">SUPPRIMER MON COMPTE</span>{" "}
              pour confirmer.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="SUPPRIMER MON COMPTE"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={cn(
                "bg-background border-destructive/50 focus:border-destructive",
                "placeholder:text-muted-foreground/50",
                "dark:border-destructive/40 dark:focus:border-destructive"
              )}
            />
            <p className="text-xs text-muted-foreground">
              Tapez exactement "SUPPRIMER MON COMPTE" pour confirmer
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting || deleteMutation.isPending || confirmation !== "SUPPRIMER MON COMPTE"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting || deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Supprimer définitivement mon compte
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}