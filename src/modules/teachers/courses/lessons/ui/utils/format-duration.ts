// modules/teachers/courses/lessons/ui/utils/format-duration.ts
export const formatDuration = (
  durationMs: number | null | undefined
): string => {
  // Si durationMs est null/undefined ou <= 0
  if (!durationMs || durationMs <= 0) return "0 min";

  // Convertir millisecondes en secondes
  const totalSeconds = Math.floor(durationMs / 1000);

  // Si la durée est déjà en secondes (cas où durée < 1000)
  if (durationMs < 1000) {
    return `${Math.floor(durationMs)} ms`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds} sec`;
};

// lib/utils/format-duration.ts
export function formatCourseDuration(
  durationMs: number | null | undefined
): string {
  if (!durationMs || durationMs <= 0) return "N/A";

  // Gérer le cas où la durée est déjà en secondes (valeur < 1000)
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const totalSeconds = Math.floor(durationMs / 1000);

  // Moins d'une minute
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Moins d'une heure
  if (minutes < 60) {
    // Afficher les secondes seulement si > 0
    if (seconds === 0) {
      return `${minutes} min`;
    }
    // Pour moins de 10 minutes, afficher aussi les secondes
    if (minutes < 10) {
      return `${minutes} min ${seconds} sec`;
    }
    return `${minutes} min`;
  }

  // Plus d'une heure
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  // Pour moins de 10 heures, afficher les minutes
  if (hours < 10) {
    return `${hours}h ${remainingMinutes}min`;
  }

  return `${hours}h`;
}
