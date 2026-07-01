import React from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
}

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group/tooltip inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover/tooltip:block bg-primary text-on-primary text-[10px] font-mono uppercase tracking-wider px-2 py-1 whitespace-nowrap z-50 shadow-md">
        {content}
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
      </div>
    </div>
  )
}
