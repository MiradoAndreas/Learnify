"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { testTriggerAction } from "@/trigger/trigger-action";

function RunStatus({
  runId,
  accessToken,
}: {
  runId: string;
  accessToken: string;
}) {
  const { run, error } = useRealtimeRun(runId, { accessToken });

  if (error) {
    return (
      <p className="text-xs text-destructive">
        Erreur temps réel : {error.message}
      </p>
    );
  }

  if (!run) {
    return <p className="text-xs text-muted-foreground">Connexion au run…</p>;
  }

  return (
    <div className="text-xs text-muted-foreground">
      <p>
        Run <code>{run.id}</code> — statut : <strong>{run.status}</strong>
      </p>
      {run.output != null && (
        <pre className="mt-1 max-w-sm overflow-x-auto rounded bg-muted p-2">
          {JSON.stringify(run.output, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function TestTriggerButton() {
  const [isPending, setIsPending] = useState(false);
  const [run, setRun] = useState<{
    runId: string;
    publicAccessToken: string;
  } | null>(null);

  async function handleClick() {
    setIsPending(true);
    setRun(null);
    try {
      const result = await testTriggerAction();
      setRun(result);
      toast.success("Tâche déclenchée", {
        description: `Run id: ${result.runId}`,
      });
    } catch (error) {
      toast.error("Le déclenchement a échoué", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={handleClick} disabled={isPending}>
        {isPending && <Loader2Icon className="animate-spin" />}
        Tester hello-world
      </Button>
      {run && (
        <RunStatus runId={run.runId} accessToken={run.publicAccessToken} />
      )}
    </div>
  );
}
