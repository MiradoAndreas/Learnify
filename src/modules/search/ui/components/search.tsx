'use client';


import React from "react";
import { Configure, Hits } from "react-instantsearch";
import { NextInstantSearch } from "./next-instant-search";
import { searchClient } from "@/lib/algolia/search-client";
import { INSTANT_SEARCH_INDEX_NAME } from "@/constants";
import PopularSearches from "./popular-search";
import HitComponent from "./hit-component";


import { CustomPagination } from "./custom-pagination";
import { Autocomplete } from "./auto-complete";
import { Fullscreen } from "lucide-react";



export function Search() {
  return (
    <NextInstantSearch
      initialUiState={{
        courses: {
          query: "",
          page: 1,
        },
      }}
      searchClient={searchClient}
      future={{
        preserveSharedStateOnUnmount: true,
        persistHierarchicalRootCount: true,
      }}
      indexName={INSTANT_SEARCH_INDEX_NAME}
      routing
      insights
    >
      <Configure hitsPerPage={4} distinct={true} clickAnalytics />
      <div className="flex flex-col containerr w-full">


        <div className="max-w-fit mx-auto py-15 md:py-30 px-4 ">
          <Autocomplete

            searchClient={searchClient}
            placeholder="Rechercher un cours..."
            detachedMediaQuery="none"
            className="rounded-none border-none w-full   "
            openOnFocus
          />
          {/* add the popular search queries */}

          <PopularSearches queries={['Développeur', 'NextJS', 'Marketing', 'Algo', 'React', 'Cours', 'il', 'beginner']} />
        </div>

      </div>

      <div className="mt-30 px-2 max-w-fit mx-auto">
        {/* the hist or the data */}
        <Hits hitComponent={({ hit }) => (
          <div className="w-full">
            <HitComponent hit={hit as any} />
          </div>
        )} />
        {/* the pagination */}
        <div className="mt-25">
          <CustomPagination />
        </div>
      </div>
    </NextInstantSearch>
  );
}