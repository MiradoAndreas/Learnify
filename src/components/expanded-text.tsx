"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const ExpandableText = ({ 
  text, 
  maxLines = 3, 
  className = "" 
}: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const calculateHeights = () => {
      const element = contentRef.current;
      if (!element) return;

      // Calculer la hauteur d'une ligne approximative
      const style = window.getComputedStyle(element);
      const lineHeight = parseFloat(style.lineHeight) || 24;
      const maxHeight = lineHeight * maxLines;
      const actualHeight = element.scrollHeight;

      setContentHeight(actualHeight);
      setNeedsTruncation(actualHeight > maxHeight);
    };

    calculateHeights();

    // Utiliser ResizeObserver pour détecter les changements de taille
    const resizeObserver = new ResizeObserver(calculateHeights);
    resizeObserver.observe(contentRef.current);

    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [text, maxLines]);

  // Hauteur pour l'état réduit
  const getCollapsedHeight = () => {
    if (!contentRef.current) return maxLines * 24;
    
    const style = window.getComputedStyle(contentRef.current);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    return Math.min(lineHeight * maxLines, contentHeight);
  };

  return (
    <div className="relative">
      {/* Contenu avec animation */}
      <motion.div
        animate={{
          height: isExpanded ? contentHeight : (needsTruncation ? getCollapsedHeight() : "auto"),
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="overflow-hidden"
      >
        <div ref={contentRef}>
          <p className={`text-muted-foreground leading-relaxed ${className}`}>
            {text}
          </p>
        </div>
      </motion.div>

      {/* Overlay gradient pour l'état réduit */}
      {!isExpanded && needsTruncation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, hsl(var(--background)))",
          }}
        />
      )}

      {/* Bouton avec animation */}
      {needsTruncation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-sm text-primary hover:text-primary/80 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-1">
              <span>{isExpanded ? "Voir moins" : "Voir plus"}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "tween", duration: 0.2 }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </motion.div>
            </div>
          </Button>
        </motion.div>
      )}
    </div>
  );
};