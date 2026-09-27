"use client";

import { useChat } from "@ai-sdk/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
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

      prepareSendMessagesRequest({ id, messages: outgoing }) {
        const last = outgoing[outgoing.length - 1];

        const text =
          last?.parts.find((part) => part.type === "text")?.text ?? "";

        return {
          body: {
            conversationId: id,
            message: text,
          },
        };
      },
    }),
  });

  useEffect(() => {
    const firstMessage = searchParams.get("m");

    if (!firstMessage || sentFirstMessage.current) {
      return;
    }

    sentFirstMessage.current = true;

    sendMessage({ text: firstMessage });

    router.replace(`/chat/${conversationId}`);
  }, [searchParams, sendMessage, router, conversationId]);

  function handleSubmit(text: string) {
    setValue("");
    sendMessage({ text });
  }

  return (
    <div className="mx-auto flex min-h-svh h-full min-w-full flex-col items-center justify-center p-4">
      {/* Messages */}
      <div className="flex-1 min-w-full w-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-y-6 py-6">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={
                  isUser
                    ? "flex w-full justify-end"
                    : "flex w-full justify-start"
                }
              >
                <div
                  className={
                    isUser
                      ? "flex max-w-[80%] flex-row-reverse items-start gap-3"
                      : "flex max-w-[80%] items-start gap-3"
                  }
                >
                  {/* Avatar du bot */}
                  {!isUser && (
                    <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background">
                      <Image
                        src="/logos/logo.svg"
                        alt="Assistant"
                        width={32}
                        height={32}
                        className="size-8 object-cover"
                      />
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={
                      isUser
                        ? "rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                        : "rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground"
                    }
                  >
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part, i) => (
                        <span key={i}>{part.text}</span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <div className="w-full max-w-3xl">
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
    </div>
  );
}
