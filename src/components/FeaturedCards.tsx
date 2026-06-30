import { FEATURED_CARDS } from '@/lib/constants'

export default function FeaturedCards() {
  return (
    <div className="space-y-6">
      {FEATURED_CARDS.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
            <div className={`${card.bgColor} rounded-full p-2`}>
              <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div>
              <div className="font-semibold text-foreground">{card.title}</div>
              <div className="text-sm text-muted">{card.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 