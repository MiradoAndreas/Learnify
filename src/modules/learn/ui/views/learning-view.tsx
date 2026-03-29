import React from 'react'

import { PlayerSection } from '../sections/player-section';
import { DetailsSection } from '../sections/details-section';
import { CommentsSection } from '@/modules/comment/ui/components/comment-section';



interface LearningViewProps {
  courseId: string;
  lessonId: string;
}

export const LearningView = ({
  courseId,
  lessonId
}: LearningViewProps) => {
  return (
    <div>
      <PlayerSection courseId={courseId} lessonId={lessonId} />
      <DetailsSection courseId={courseId} lessonId={lessonId} />
      <CommentsSection courseId={courseId} lessonId={lessonId} />

    </div>
  )
}
