// components/ui/rich-text-display.tsx
"use client";

import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700",
        "prose-a:text-blue-600 hover:prose-a:text-blue-800",
        "prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
