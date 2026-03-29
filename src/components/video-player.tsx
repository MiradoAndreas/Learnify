"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useRef } from "react";

interface VideoPlayerProps {
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  onProgress?: (data: {
    lastPosition: number;
    duration: number;
  }) => void;
  onEnded?: () => void;
}

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay = false,
  onProgress,
  onEnded,
}: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const lastSentRef = useRef(0);

  if (!playbackId) {
    return (
      <div className="aspect-video bg-muted flex items-center justify-center">
        Vidéo non disponible
      </div>
    );
  }

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = Math.floor(player.currentTime || 0);
    const duration = Math.floor(player.duration || 0);
    if (!duration) return;

    if (currentTime - lastSentRef.current >= 5) {
      lastSentRef.current = currentTime;

      onProgress?.({
        lastPosition: currentTime,
        duration,
      });
    }
  };

  const handleEnded = () => {
    const player = playerRef.current;
    if (!player) return;

    const duration = Math.floor(player.duration || 0);

    onProgress?.({
      lastPosition: duration,
      duration,
    });

    onEnded?.();
  };

  return (
    <div className="relative aspect-video bg-black">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        poster={thumbnailUrl || undefined}
        streamType="on-demand"
        autoPlay={autoPlay}
        className="w-full h-full"
        accentColor="#3b82f6"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};