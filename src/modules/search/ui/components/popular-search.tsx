// modules/search/ui/components/popular-search.tsx
import { Button } from '@/components/ui/button';
import React from 'react'
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch'
import { TrendingUpIcon } from 'lucide-react';

interface PopularSearchQueries extends UseSearchBoxProps {
  queries: string[]
}

export default function PopularSearches({ queries, ...props }: PopularSearchQueries) {
  const { refine } = useSearchBox(props);

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUpIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Recherches populaires</span>
      </div>

      <div className='flex flex-wrap gap-3'>
        {queries.map((query: string, index: number) => (
          <Button
            key={index}
            variant={'outline'}
            onClick={() => refine(query)}
            className="rounded-full px-4 py-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="text-gray-700">
              {query}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}