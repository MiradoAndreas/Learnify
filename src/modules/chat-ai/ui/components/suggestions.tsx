import { BugIcon, FileTextIcon, LightbulbIcon, MailIcon } from "lucide-react";

export interface ChatSuggestion {
  label: string;
  prompt: string;
  icon: typeof BugIcon;
}

export const suggestions: ChatSuggestion[] = [
  {
    label: "Summarize a document",
    prompt: "Summarize the key points of this document in a few bullets.",
    icon: FileTextIcon,
  },
  {
    label: "Draft an email",
    prompt:
      "Draft a polite follow-up email to a client who hasn't replied in a week.",
    icon: MailIcon,
  },
  {
    label: "Explain a concept",
    prompt: "Explain how neural networks learn, in simple terms.",
    icon: LightbulbIcon,
  },
  {
    label: "Debug my code",
    prompt: "Help me find why my React component keeps re-rendering.",
    icon: BugIcon,
  },
];
