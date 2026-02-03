
import { hi } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { Highlight } from 'react-instantsearch'

interface HitProps {
  hit: {
    title: string
    price: number
    description: string
    level: "beginner" | "intermediate" | "advanced";
    thumbnailUrl: string
    publishedAt: string;
    objectID: string;
  }
}

export default function HitComponent({ hit }: HitProps) {

  return (
    <Link href={`/home/${hit.objectID}`}>
      <div className="flex items-center gap-x-4 bg-white hover:bg-gray-100 px-6 py-8  hover:shadow-md cursor-pointer ">
        <Image src={hit.thumbnailUrl} alt={hit.title} width={100} height={100} className='rounded-md object-cover ' />
        <div className='flex flex-col '>
          <h2 className="font-bold text-md ">
            <Highlight hit={hit as any} attribute="title" />
          </h2>
          <p className="text-sm text-muted-foreground  mt-1 mb-3">
            <Highlight hit={hit as any} attribute="description" />

          </p>
          <p className='text-blue-500 text-md font-medium'>
            {hit.level}
          </p>
        </div>
      </div>
    </Link>
  );
}