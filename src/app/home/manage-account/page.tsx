
import { requireAuth } from "@/lib/auth-utils";
import { ManageView } from "@/modules/users/ui/views/manage-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
const Page = async () => {
  await requireAuth();

  prefetch(
    trpc.user.getProfile.queryOptions()
  )



  return (

    <HydrateClient>
      <ManageView />
    </HydrateClient>

  )
}

export default Page