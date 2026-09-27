"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

import { ChatComposer } from "./chat-composer";
import { ChatModelId, DEFAULT_CHAT_MODEL_ID } from "./chat-models";
import { suggestions } from "./suggestions";

function titleFromPrompt(prompt: string) {
  return prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt;
}

/**
 * Client boundary for the home page composer. `trpc.chat.create` only opens
 * an empty conversation row — the prompt itself is sent once we land on
 * `/chat/[id]`, via a query param `ChatView` picks up on mount and sends
 * through `/api/chat`. There's no conversation to attach the message to
 * before that row exists.
 */
export function NewChatComposer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState<ChatModelId>(DEFAULT_CHAT_MODEL_ID);
  // The full prompt, kept outside the mutation's input (which only carries
  // the truncated title) so the query param can carry it unabridged.
  const pendingPrompt = useRef("");

  const createConversation = useMutation(
    trpc.chat.create.mutationOptions({
      onSuccess: (conversation) => {
        queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        router.push(
          `/chat/${conversation!.id}?m=${encodeURIComponent(pendingPrompt.current)}`,
        );
      },
    }),
  );

  const isPending = createConversation.isPending;

  function handleSubmit(value: string) {
    pendingPrompt.current = value;
    createConversation.mutate({ title: titleFromPrompt(value) });
  }

  function handleSuggestion(suggestionPrompt: string) {
    // Into the box as well as into the call: on the happy path the
    // navigation means nobody sees it, but if the create fails the player is
    // left looking at the prompt that failed rather than an empty composer —
    // the same bargain the typed path already makes.
    setPrompt(suggestionPrompt);
    handleSubmit(suggestionPrompt);
  }

  return (
    <>
      <ChatComposer
        value={prompt}
        onValueChange={setPrompt}
        onSubmit={handleSubmit}
        modelId={modelId}
        onModelChange={setModelId}
        disabled={isPending}
      />
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.label}
            variant="outline"
            size="sm"
            className="rounded-full font-normal text-muted-foreground"
            disabled={isPending}
            onClick={() => handleSuggestion(suggestion.prompt)}
          >
            <suggestion.icon />
            {suggestion.label}
          </Button>
        ))}
      </div>
    </>
  );
}
