"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";

interface Lesson {
  id: string;
  title: string;
  muxPlaybackId?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  sectionTitle: string;
}

interface LessonVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessons: Lesson[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
}

export const LessonVideoModal = ({
  open,
  onOpenChange,
  lessons,
  currentIndex,
  onChangeIndex,
}: LessonVideoModalProps) => {
  const currentLesson = lessons[currentIndex];

  if (!currentLesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="backdrop-blur-sm bg-black/50" />
      <DialogContent className="max-w-6xl p-0 grid grid-cols-1  overflow-hidden">
    <DialogTitle>
      
    </DialogTitle>
    


        {/* PLAYER */}
        <div className=" bg-black">
          <div className="aspect-video">
            <VideoPlayer
              playbackId={currentLesson.muxPlaybackId}
              thumbnailUrl={currentLesson.thumbnailUrl}
              autoPlay
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between px-4 py-3 bg-gray-900 text-white">
            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => onChangeIndex(currentIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <Button
              variant="ghost"
              disabled={currentIndex === lessons.length - 1}
              onClick={() => onChangeIndex(currentIndex + 1)}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* PLAYLIST */}
        <div className="border-l bg-white overflow-y-auto max-h-[80vh]">
          <div className="p-4 font-semibold">
            Leçons gratuites ({lessons.length})
          </div>

          <ul className="space-y-1 px-2">
            {lessons.map((lesson, index) => (
              <li
                key={lesson.id}
                onClick={() => onChangeIndex(index)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm
                  ${index === currentIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100"
                  }`}
              >
                <PlayCircle className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="font-medium truncate">{lesson.title}</div>
                  <div className="text-xs text-gray-500">
                    {lesson.sectionTitle}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </DialogContent>
    </Dialog>
  );
};
