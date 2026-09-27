export type ChatModelId = "fast" | "balanced" | "quality";

export const DEFAULT_CHAT_MODEL_ID: ChatModelId = "balanced";

export const chatModels: { id: ChatModelId; label: string }[] = [
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "quality", label: "Quality" },
];
