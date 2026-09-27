import { MyCourseView } from "@/modules/my-courses/ui/views/my-course-view"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"
export const dynamic = "force-dynamic"

const Page = async () => {
  prefetch(
    trpc.paiement.getMyCourses.queryOptions()
  )
  return (
    <HydrateClient>
      <MyCourseView />
    </HydrateClient>
  )
}

export default Page
