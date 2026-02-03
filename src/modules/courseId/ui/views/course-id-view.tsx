
import { CourseAudienceSection } from "../sections/course-audience-section";
import { CourseCompetencesSection } from "../sections/course-competences-section";
import { CourseHeroSection } from "../sections/course-hero-section";
import { CourseInstructorSection } from "../sections/course-instructor-section";
import { CourseObjectivesSection } from "../sections/course-objectives-section";
import { CourseResourcesSection } from "../sections/course-ressources-section";
import { CoursePreviewController } from "../sections/course-preview-controll";

interface CourseIdViewProps {
  courseId: string;
}

export const CourseIdView = ({ courseId }: CourseIdViewProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8">
      
          {/** Contenu principal */}
          <div className="flex flex-col gap-8 md:gap-10">
            <CoursePreviewController courseId={courseId} />
            <CourseHeroSection courseId={courseId} />
            <CourseInstructorSection courseId={courseId} />
            <CourseObjectivesSection courseId={courseId} />
            <CourseCompetencesSection courseId={courseId} />
            <CourseAudienceSection courseId={courseId} />
            <CourseResourcesSection courseId={courseId} />
          </div>
        </div>
      </div>
    
  );
};