import { requireAuth } from "@/lib/auth-utils";
import { TeacherDashboardView } from "@/modules/teachers/ui/view/teacher-dashboard-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  
 
  prefetch(trpc.teacher.getMyCourses.queryOptions());

  return (
    <HydrateClient>
      <TeacherDashboardView />
    </HydrateClient>
  );
};

export default Page;
