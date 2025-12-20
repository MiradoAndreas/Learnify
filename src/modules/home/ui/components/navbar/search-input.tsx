import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  isMobile?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  isMobile = false,
  className,
}) => {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      console.log("Searching for:", search);
      // Implémentez la logique de recherche ici
    }
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className={cn("w-full", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search courses, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-xl border-2 border-input focus:border-primary"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearch("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsExpanded(true)}
        >
          <Search className="w-5 h-5" />
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
        >
          <div className="relative flex items-center bg-background rounded-full border border-input shadow-lg animate-in slide-in-from-right-5 duration-200">
            <Search className="absolute left-3 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10 pr-10 h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={() => setSearch("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchInput;
