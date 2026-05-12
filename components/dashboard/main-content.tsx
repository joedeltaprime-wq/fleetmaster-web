'use client'

import { useSidebar } from '@/lib/sidebar-context'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

export function MainContent({ children, className }: MainContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div 
      className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "pl-[70px]" : "pl-[220px]",
        className
      )}
    >
      {children}
    </div>
  )
}
