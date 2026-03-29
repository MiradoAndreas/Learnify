
import { useEffect } from "react";
import { Button } from "./ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Spinner } from "./ui/spinner";
import { Laugh, RefreshCcw } from "lucide-react";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  textInEnd?: string;
}

export const InfiniteScroll = ({
  isManual = true,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  textInEnd
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button

          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? <RefreshCcw className="animate-spin" /> : <RefreshCcw />}
          {isFetchingNextPage ? "Chargement..." : "Charger plus"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {textInEnd || "Vous avez atteind la fin de la liste"}
        </p>
      )}
    </div>
  );
};
