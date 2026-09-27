"use client";

import { useChat } from "@ai-sdk/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useTRPC } from "@/trpc/client";

import { ChatComposer } from "../components/chat-composer";
import { ChatModelId, DEFAULT_CHAT_MODEL_ID } from "../components/chat-models";

export function ChatView({ conversationId }: { conversationId: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: history } = useSuspenseQuery(
    trpc.chat.messages.queryOptions({ conversationId }),
  );

  const [value, setValue] = useState("");
  const [modelId, setModelId] = useState<ChatModelId>(DEFAULT_CHAT_MODEL_ID);
  const sentFirstMessage = useRef(false);

  const { messages, sendMessage, status, stop } = useChat({
    id: conversationId,
    messages: history.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Our route only needs the new message text — it reloads the rest of
      // the history from the DB itself — so the default { id, messages }
      // body useChat sends gets reshaped to match that contract.
      prepareSendMessagesRequest({ id, messages: outgoing }) {
        const last = outgoing[outgoing.length - 1];
        const text =
          last?.parts.find((part) => part.type === "text")?.text ?? "";

        return { body: { conversationId: id, message: text } };
      },
    }),
  });

  // The homepage composer hands off the first prompt through a query param
  // instead of sending it itself — the conversation row didn't exist yet to
  // attach it to. Send it once here, then strip the param so a refresh
  // doesn't resend it.
  useEffect(() => {
    const firstMessage = searchParams.get("m");
    if (!firstMessage || sentFirstMessage.current) return;
    sentFirstMessage.current = true;
    sendMessage({ text: firstMessage });
    router.replace(`/chat/${conversationId}`);
  }, [searchParams, sendMessage, router, conversationId]);

  function handleSubmit(text: string) {
    setValue("");
    sendMessage({ text });
  }

  return (
    <div className="mx-auto  h-full min-w-full  p-4 flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex-1 min-w-full overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "mr-auto max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
            }
          >
            {message.parts
              .filter((part) => part.type === "text")
              .map((part, i) => (
                <span key={i}>{part.text}</span>
              ))}
          </div>
        ))}
      </div>

      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={handleSubmit}
        onStop={stop}
        modelId={modelId}
        onModelChange={setModelId}
        streaming={status === "streaming"}
      />
    </div>
  );
}
