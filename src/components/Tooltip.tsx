import React from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const posClasses =
    position === 'bottom'
      ? 'top-full left-1/2 -translate-x-1/2 mt-2'
      : position === 'left'
      ? 'right-full top-1/2 -translate-y-1/2 mr-2'
      : position === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : 'bottom-full left-1/2 -translate-x-1/2 mb-2'

  const arrowClasses =
    position === 'bottom'
      ? 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-primary'
      : position === 'left'
      ? 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary'
      : position === 'right'
      ? 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary'
      : 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary'

  return (
    <div className={`relative group/tooltip inline-flex ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute ${posClasses} hidden group-hover/tooltip:block bg-primary text-canvas-white text-[11px] font-sans font-normal normal-case leading-snug px-2.5 py-1.5 w-max max-w-[220px] text-center z-[1400] shadow-lg`}
      >
        {content}
        <div className={`absolute ${arrowClasses}`} />
      </div>
    </div>
  )
}
