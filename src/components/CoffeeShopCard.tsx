'use client'

import { useState } from 'react'
import { Wifi, MapPin, Heart, X } from 'lucide-react'
import RatingBar from './RatingBar'

interface CoffeeShopCardProps {
  cafe: {
    id: number
    name: string
    location: string
    image: string
    ratings: {
      overall: number
      price: number
      wifi: number
      coffee: number
      noise: number
      outlets: number
    }
    wifiSpeed: string
    priceRange: string
    weather: { temp: number; icon: string }
    isOpen: boolean
    crowdLevel: string
  }
}

export default function CoffeeShopCard({ cafe }: CoffeeShopCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      default: return '☀️'
    }
  }

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'empty': return 'text-green-500'
      case 'moderate': return 'text-yellow-500'
      case 'busy': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div
      className="relative group cursor-pointer cafe-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="relative aspect-[4/4.5] min-h-[260px] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        {/* Placeholder background - in real app this would be cafe image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
        
        {/* Ranking Number */}
        <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-sm font-bold text-foreground">
          {cafe.id}
        </div>

        {/* Wifi Speed */}
        <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-medium text-foreground">
          <Wifi className="w-3 h-3 text-accent" />
          {cafe.wifiSpeed}
        </div>

        {/* Center Overlay - Cafe Info */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
            {cafe.name}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-sm drop-shadow-lg">
            <MapPin className="w-3 h-3" />
            {cafe.location}
          </div>
        </div>

        {/* Bottom Overlay - Weather, Price, Tag */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <span>{getWeatherIcon(cafe.weather.icon)}</span>
              <span>{cafe.weather.temp}°</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{cafe.priceRange} / cup</div>
              <div className="text-xs text-white/70">FOR COFFEE LOVERS</div>
            </div>
          </div>
        </div>

        {/* Hover Overlay - Detailed Ratings */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col justify-center rating-overlay">
            {/* Top icons row */}
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-6 h-6 text-white" />
              <X className="w-6 h-6 text-white cursor-pointer opacity-70 hover:opacity-100 transition" onClick={() => setIsHovered(false)} />
            </div>
            {/* Ratings list */}
            <div className="flex flex-col gap-1 w-full">
              <RatingBar label="Overall" rating={cafe.ratings.overall} icon="🏆" />
              <RatingBar label="Price" rating={cafe.ratings.price} icon="💰" />
              <RatingBar label="Wifi" rating={cafe.ratings.wifi} icon="📶" />
              <RatingBar label="Coffee" rating={cafe.ratings.coffee} icon="☕" />
              <RatingBar label="Quiet" rating={cafe.ratings.noise} icon="🔇" />
              <RatingBar label="Outlets" rating={cafe.ratings.outlets} icon="⚡" />
            </div>
            {/* Optionally, crowd/open info can be shown below if needed */}
          </div>
        )}
      </div>

      {/* Hover Animation */}
      <div className="absolute inset-0 rounded-xl transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1" />
    </div>
  )
} 