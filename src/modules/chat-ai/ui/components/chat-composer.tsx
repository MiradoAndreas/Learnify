"use client";

import { ArrowUpIcon, SquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ChatModelId } from "./chat-models";

export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  modelId,
  onModelChange,
  streaming = false,
  disabled = false,
  placeholder = "Ask me anything…",
}: {
  value: string;
  onValueChange: (value: string) => void;
  /** Receives the trimmed prompt; only called when it is non-empty. */
  onSubmit: (value: string) => void;
  /** Cancels the turn in flight. Required for the button to offer a stop. */
  onStop?: () => void;
  /** The model the next turn runs on, and the way to change it. */
  modelId: ChatModelId;
  onModelChange: (modelId: ChatModelId) => void;
  /** A turn is in flight, so the submit button becomes a stop button. */
  streaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const prompt = value.trim();
  const canSubmit = prompt.length > 0 && !disabled;
  // Stop replaces send rather than sitting beside it, so the one button in the
  // corner always drives the turn: start it, then end it.
  const canStop = streaming && Boolean(onStop);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit(prompt);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter keeps the newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <InputGroup className="bg-popover">
        <InputGroupTextarea
          name="prompt"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="field-sizing-content max-h-48 min-h-10"
        />
        <InputGroupAddon align="block-end">
          {/* <ModelPicker modelId={modelId} onModelChange={onModelChange} /> */}
          {/* Radix/native <button> defaults to type="submit" inside a form
              when no type is given — unlike Base UI, which defaulted its
              Button to type="button". The Stop button needs it spelled out
              explicitly, or clicking it would submit the form instead of
              just cancelling the turn. */}
          {canStop ? (
            <Button
              type="button"
              size="icon-lg"
              onClick={onStop}
              aria-label="Stop generating"
              className="ml-auto rounded-full"
            >
              <SquareIcon className="fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-lg"
              disabled={!canSubmit}
              aria-label="Send message"
              className="ml-auto rounded-full"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
