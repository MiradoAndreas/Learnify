// modules/home/components/search-input.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

export const SearchInput = () => {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-full max-w-[600px]" />}>
      <SearchInputSuspense />
    </Suspense>
  );
};

const SearchInputSuspense = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const [value, setValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleNavigation();
  };

  const handleNavigation = () => {
    const url = new URL("/home/search", APP_URL);
    const newQuery = value.trim();

    if (newQuery) {
      url.searchParams.set("query", encodeURIComponent(newQuery));
    }

    if (categoryId) {
      url.searchParams.set("categoryId", categoryId);
    }

    router.push(url.toString());
  };

  return (
    <div className="relative">
      <form
        className={`flex w-full max-w-[600px] transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20 ring-offset-2 rounded-full' : ''
          }`}
        onSubmit={handleSearch}
      >
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            type="text"
            placeholder="Qu'est-ce que vous voulez apprendre ?"
            className="w-full pl-12 pr-10 py-3 rounded-l-full border border-gray-300 bg-white focus:outline-none focus:border-primary text-sm"
          />

          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setValue("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-6 w-6 p-0"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          type="submit"
          disabled={!value.trim()}
          className="px-6 py-3 bg-primary h-full text-primary-foreground rounded-r-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Rechercher
        </Button>
      </form>
      <div className="absolute right-0 top-15 text-right">
        <Button asChild variant="link">
          <Link href="/deep-search">
            <p className="text-xs text-muted-foreground">Cliquer ici pour effectuer un recherche plus puissant</p></Link>
        </Button>
      </div>
    </div>
  );
};