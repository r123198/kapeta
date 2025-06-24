'use client'

import { useState, useEffect } from 'react'
import CoffeeShopCard from './CoffeeShopCard'

// Mock data for coffee shops
const mockCafes = [
  {
    id: 1,
    name: "Kape Alley",
    location: "City Center, Iligan",
    image: "/placeholder-cafe-1.jpg",
    ratings: {
      overall: 4.2,
      price: 3.0,
      wifi: 4.5,
      coffee: 4.8,
      noise: 3.2,
      outlets: 4.0
    },
    wifiSpeed: "35 Mbps",
    priceRange: "₱90-180",
    weather: { temp: 27, icon: "sunny" },
    isOpen: true,
    crowdLevel: "moderate"
  },
  {
    id: 2,
    name: "Brew & Grind Co",
    location: "Tibanga, Iligan",
    image: "/placeholder-cafe-2.jpg",
    ratings: {
      overall: 4.5,
      price: 3.5,
      wifi: 4.8,
      coffee: 4.9,
      noise: 4.2,
      outlets: 4.5
    },
    wifiSpeed: "28 Mbps",
    priceRange: "₱70-120",
    weather: { temp: 26, icon: "cloudy" },
    isOpen: true,
    crowdLevel: "empty"
  },
  {
    id: 3,
    name: "MSU Coffee Hub",
    location: "University Area",
    image: "/placeholder-cafe-3.jpg",
    ratings: {
      overall: 4.0,
      price: 4.2,
      wifi: 4.9,
      coffee: 3.8,
      noise: 2.8,
      outlets: 4.8
    },
    wifiSpeed: "45 Mbps",
    priceRange: "₱60-100",
    weather: { temp: 28, icon: "sunny" },
    isOpen: true,
    crowdLevel: "busy"
  },
  {
    id: 4,
    name: "Cafe Palao",
    location: "Palao, Iligan",
    image: "/placeholder-cafe-4.jpg",
    ratings: {
      overall: 3.8,
      price: 4.0,
      wifi: 3.5,
      coffee: 4.2,
      noise: 4.5,
      outlets: 3.2
    },
    wifiSpeed: "22 Mbps",
    priceRange: "₱80-150",
    weather: { temp: 25, icon: "rainy" },
    isOpen: false,
    crowdLevel: "empty"
  },
  {
    id: 5,
    name: "Mahayahay Brew",
    location: "Mahayahay, Iligan",
    image: "/placeholder-cafe-5.jpg",
    ratings: {
      overall: 4.3,
      price: 3.8,
      wifi: 4.2,
      coffee: 4.6,
      noise: 3.8,
      outlets: 4.1
    },
    wifiSpeed: "32 Mbps",
    priceRange: "₱75-130",
    weather: { temp: 27, icon: "sunny" },
    isOpen: true,
    crowdLevel: "moderate"
  },
  {
    id: 6,
    name: "Tambo Coffee Corner",
    location: "Tambo, Iligan",
    image: "/placeholder-cafe-6.jpg",
    ratings: {
      overall: 3.9,
      price: 4.1,
      wifi: 3.8,
      coffee: 4.0,
      noise: 4.0,
      outlets: 3.5
    },
    wifiSpeed: "25 Mbps",
    priceRange: "₱65-110",
    weather: { temp: 26, icon: "cloudy" },
    isOpen: true,
    crowdLevel: "moderate"
  },
  {
    id: 7,
    name: "City Center Espresso",
    location: "City Center, Iligan",
    image: "/placeholder-cafe-7.jpg",
    ratings: {
      overall: 4.1,
      price: 3.2,
      wifi: 4.3,
      coffee: 4.4,
      noise: 3.5,
      outlets: 4.2
    },
    wifiSpeed: "38 Mbps",
    priceRange: "₱85-160",
    weather: { temp: 28, icon: "sunny" },
    isOpen: true,
    crowdLevel: "busy"
  },
  {
    id: 8,
    name: "University Grounds",
    location: "University Area",
    image: "/placeholder-cafe-8.jpg",
    ratings: {
      overall: 3.7,
      price: 4.3,
      wifi: 4.6,
      coffee: 3.5,
      noise: 2.5,
      outlets: 4.7
    },
    wifiSpeed: "42 Mbps",
    priceRange: "₱55-95",
    weather: { temp: 27, icon: "sunny" },
    isOpen: true,
    crowdLevel: "busy"
  },
  {
    id: 9,
    name: "Tibanga Terrace",
    location: "Tibanga, Iligan",
    image: "/placeholder-cafe-9.jpg",
    ratings: {
      overall: 4.4,
      price: 3.6,
      wifi: 4.1,
      coffee: 4.7,
      noise: 4.3,
      outlets: 3.8
    },
    wifiSpeed: "30 Mbps",
    priceRange: "₱70-125",
    weather: { temp: 25, icon: "cloudy" },
    isOpen: true,
    crowdLevel: "empty"
  },
  {
    id: 10,
    name: "Palao Perk",
    location: "Palao, Iligan",
    image: "/placeholder-cafe-10.jpg",
    ratings: {
      overall: 3.6,
      price: 4.0,
      wifi: 3.2,
      coffee: 4.1,
      noise: 4.4,
      outlets: 3.0
    },
    wifiSpeed: "20 Mbps",
    priceRange: "₱75-140",
    weather: { temp: 26, icon: "rainy" },
    isOpen: false,
    crowdLevel: "empty"
  }
]

interface CoffeeShopGridProps {
  filters: any
  maxCols?: {
    '2xl'?: number
    xl?: number
    lg?: number
  }
}

export default function CoffeeShopGrid({ filters, maxCols }: CoffeeShopGridProps) {
  const [filteredCafes, setFilteredCafes] = useState(mockCafes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    
    // Simulate filtering delay
    const timer = setTimeout(() => {
      let filtered = [...mockCafes]

      // Search filter
      if (filters.search) {
        filtered = filtered.filter(cafe => 
          cafe.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          cafe.location.toLowerCase().includes(filters.search.toLowerCase())
        )
      }

      // Location filter
      if (filters.location && filters.location !== 'All Iligan Areas') {
        filtered = filtered.filter(cafe => 
          cafe.location.includes(filters.location)
        )
      }

      // Rating filters
      if (filters.overall > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.overall >= filters.overall)
      }
      if (filters.price > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.price >= filters.price)
      }
      if (filters.wifi > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.wifi >= filters.wifi)
      }
      if (filters.coffee > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.coffee >= filters.coffee)
      }
      if (filters.noise > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.noise >= filters.noise)
      }
      if (filters.outlets > 0) {
        filtered = filtered.filter(cafe => cafe.ratings.outlets >= filters.outlets)
      }

      setFilteredCafes(filtered)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  // Build grid classes based on maxCols prop
  let gridClass = 'grid gap-6 px-2 sm:px-4'
  if (maxCols) {
    // Use auto-fit/minmax for responsive wrapping when filter is open
    gridClass += ' grid-cols-[repeat(auto-fit,minmax(260px,1fr))]'
    if (maxCols.lg) gridClass += ` lg:max-w-[${maxCols.lg*300}px]` // limit max width if needed
  } else {
    gridClass += ' grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }

  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (filteredCafes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">☕</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No coffee shops found</h3>
        <p className="text-muted">Try adjusting your filters to find more cafes</p>
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {filteredCafes.map((cafe) => (
        <CoffeeShopCard key={cafe.id} cafe={cafe} />
      ))}
    </div>
  )
} 