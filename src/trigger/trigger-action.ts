"use server";

import { auth, tasks } from "@trigger.dev/sdk";

export async function testTriggerAction() {
  const handle = await tasks.trigger("hello-world", {
    message: "ping from the frontend test button",
  });

  // Scoped to this one run only — never hand the client the full secret key.
  const publicAccessToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
  });

  return { runId: handle.id, publicAccessToken };
}
