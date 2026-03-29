"use client"
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ExpandableRichTextProps {
  content: string;
  maxLines?: number;
  className?: string;
}

export const ExpandableRichText = ({
  content,
  maxLines = 3,
  className = ""
}: ExpandableRichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;

    const calculateHeights = () => {
      const style = window.getComputedStyle(element);
      const lineHeight = parseFloat(style.lineHeight) || 24;
      const maxHeight = lineHeight * maxLines;
      const actualHeight = element.scrollHeight;

      setContentHeight(actualHeight);
      setNeedsTruncation(actualHeight > maxHeight);
    };

    calculateHeights();

    const resizeObserver = new ResizeObserver(calculateHeights);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [content, maxLines]);

  const getCollapsedHeight = () => {
    if (!contentRef.current) return maxLines * 24;

    const style = window.getComputedStyle(contentRef.current);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    return lineHeight * maxLines;
  };

  return (
    <div className="relative">
      <motion.div
        animate={{
          height: isExpanded
            ? contentHeight
            : needsTruncation
              ? getCollapsedHeight()
              : "auto",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden"
      >
        <div
          ref={contentRef}
          className={`prose prose-sm max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </motion.div>

      {!isExpanded && needsTruncation && (
        <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-linear-to-b from-transparent to-background" />
      )}

      {needsTruncation && (
        <Button

          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </Button>
      )}
    </div>
  );
};
