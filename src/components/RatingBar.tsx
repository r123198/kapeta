interface RatingBarProps {
  label: string
  rating: number
  maxRating?: number
  icon?: string
  showValue?: boolean
}

export default function RatingBar({ 
  label, 
  rating, 
  maxRating = 5, 
  icon, 
  showValue = false // default to false for compressed list
}: RatingBarProps) {
  const percentage = (rating / maxRating) * 100
  
  const getColor = (rating: number) => {
    if (rating >= 4.0) return 'bg-accent' // Green for good
    if (rating >= 2.5) return 'bg-warning' // Yellow for average
    return 'bg-red-500' // Red for poor
  }

  return (
    <div className="flex items-center gap-2 w-full min-w-0 py-0.5">
      {icon && <span className="text-xl w-6 flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="text-base font-medium text-foreground truncate flex-shrink-0" style={{ minWidth: 64 }}>{label}</span>
      <div className="flex-1 flex items-center min-w-[40px] max-w-[180px] mx-2">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${getColor(rating)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {/* No value on the right */}
    </div>
  )
} 