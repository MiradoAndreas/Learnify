import { Button } from "@/components/ui/button";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface CourseSidebarHeaderProps {
  title: string

}

export const CourseSidebarHeader = ({ title }: CourseSidebarHeaderProps) => {
  return (
    <Link href={`/home/my-courses`}>
      <Button className="flex items-center gap-2 w-fit rounded-full" variant="outline" >
        <ArrowLeftIcon />
        <h1 className="">{title}</h1>
      </Button>
    </Link>
  )
}
