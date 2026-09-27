import { ChatView } from "@/modules/chat-ai/ui/views/chat-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { conversationId } = await params;

  prefetch(trpc.chat.messages.queryOptions({ conversationId }));

  return (
    <HydrateClient>
      <ChatView conversationId={conversationId} />
    </HydrateClient>
  );
};

export default Page;
