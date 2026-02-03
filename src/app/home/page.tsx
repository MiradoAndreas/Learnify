
import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  
  const { categoryId } = await searchParams;
  prefetch(trpc.category.getMany.queryOptions());
  prefetch(
    trpc.course.getAllPublishedCourses.infiniteQueryOptions({
      categoryId,
      limit: DEFAULT_COURSE_LIMIT,
    })
  );
  
  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
