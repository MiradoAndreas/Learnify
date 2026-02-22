// modules/home/components/search-input.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleNavigation();
  };

  useEffect(() => {
    const handleScroll = () => {
      // Cache le lien après 50 px de scroll
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
        className={`flex w-full max-w-[600px] transition-all duration-300 ${isFocused
          ? 'ring-2 ring-primary/20 dark:ring-primary/30 ring-offset-2 ring-offset-background dark:ring-offset-background rounded-full'
          : ''
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
            className="w-full pl-12 pr-10 py-3 rounded-l-full 
              border border-input bg-background 
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:border-primary 
              dark:border-gray-700 dark:bg-gray-950 
              dark:focus:border-primary dark:placeholder:text-gray-500
              text-sm transition-colors"
          />

          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-500" />

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setValue("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-6 w-6 p-0 
                text-muted-foreground hover:text-foreground 
                dark:text-gray-400 dark:hover:text-gray-200 
                hover:bg-accent dark:hover:bg-gray-800"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          type="submit"
          disabled={!value.trim()}
          className="px-6 py-3 bg-primary h-full text-primary-foreground 
            rounded-r-full hover:bg-primary/90 
            disabled:opacity-50 disabled:cursor-not-allowed 
            text-sm font-medium border border-l-0 
            dark:border-gray-700 dark:bg-primary dark:hover:bg-primary/90
            transition-colors"
        >
          Rechercher
        </Button>
      </form>

      {isVisible && (
        <div className="absolute right-0 top-10 md:top-15 text-right">
          <Button
            asChild
            variant="link"
            className="text-muted-foreground hover:text-primary 
              dark:text-gray-400 dark:hover:text-primary 
              transition-colors"
          >
            <Link href="/deep-search">
              <p className="text-xs">
                Cliquer ici pour effectuer une recherche plus puissante
              </p>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};