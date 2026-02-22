import { TeacherBasicInfoSection } from "../sections/teacher-basic-information-section"
import { TeacherCoursesSection } from "../sections/teacher-courses-section"

interface TeacherPageViewProps {
  id: string
}

export const TeacherPageView = ({ id }: TeacherPageViewProps) => {
  return (
    <div className="pt-20">
      <TeacherBasicInfoSection id={id} />
      <TeacherCoursesSection id={id} />
    </div>
  )
}
