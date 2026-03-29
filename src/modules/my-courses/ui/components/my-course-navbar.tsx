import { SidebarTrigger } from '@/components/ui/sidebar'


export const MyCourseNavbar = () => {
  return (
    <div className='fixed top-0 left-0 right-0 h-16 md:h-20 lg:h-25 flex items-center px-2 sm:px-4 md:px-6 z-50 transition-all duration-300  gap-2 sm:gap-4 w-full '>
      <div className="flex items-center shrink-0">
        <SidebarTrigger className="lg-flex" />
      </div>
    </div>
  )
}
