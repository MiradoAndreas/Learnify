import Image from "next/image";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { NewChatComposer } from "@/modules/chat-ai/ui/components/new-chat-composer";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <Empty className="flex-none">
        <EmptyHeader className="max-w-2xl">
          <EmptyMedia>
            <Image src="/logos/logo.svg" alt="Logo" width={48} height={48} />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">Bonjour👋</EmptyTitle>
          <EmptyDescription>
            Posez une question, collez un élément sur lequel vous souhaitez de
            l'aide, ou choisissez un point de départ ci-dessous — la
            conversation se poursuivra à partir de là.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-2xl gap-6">
          <NewChatComposer />
        </EmptyContent>
      </Empty>
    </div>
  );
}
