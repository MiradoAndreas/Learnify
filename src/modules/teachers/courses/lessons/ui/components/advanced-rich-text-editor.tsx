"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/* =========================
   MENU BAR
========================= */
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50 dark:bg-gray-900/50 rounded-t-lg">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("bold") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("italic") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("underline") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <u className="text-xs font-bold">U</u>
      </Button>

      <div className="w-px h-4 bg-border dark:bg-gray-700 mx-1" />

      {/* H2 */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      {/* H3 */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("heading", { level: 3 }) && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      {/* Paragraph */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cn(
          "h-8 w-8 p-0 text-xs text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("paragraph") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        P
      </Button>

      <div className="w-px h-4 bg-border dark:bg-gray-700 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("bulletList") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("orderedList") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border dark:bg-gray-700 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("blockquote") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          "h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
          editor.isActive("code") && "bg-accent text-accent-foreground dark:bg-gray-700"
        )}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

/* =========================
   EDITOR
========================= */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez votre contenu ici...",
  className,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 dark:text-primary dark:hover:text-primary/80",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none tiptap-editor bg-background text-foreground",
      },
    },
    injectCSS: false,
    immediatelyRender: false,
  });

  if (!mounted || !editor) {
    return (
      <div className={cn("border border-border rounded-lg p-4 bg-card", className)}>
        <div className="text-muted-foreground italic">
          Chargement de l'éditeur…
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-card", className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-background" />
      <div className="px-4 py-2 border-t border-border bg-muted/50 dark:bg-gray-900/50 text-xs text-muted-foreground">
        Alt+2 → H2 • Alt+3 → H3
      </div>
    </div>
  );
}