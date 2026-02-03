import { DEFAULT_COURSE_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>
}



const Page = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = await searchParams
  prefetch(
    trpc.search.searchCourses.infiniteQueryOptions({
      query: query,
      categoryId: categoryId,
      limit: DEFAULT_COURSE_LIMIT
    })
  )
  prefetch(
    trpc.category.getMany.queryOptions()
  )



  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  )
}

export default Page