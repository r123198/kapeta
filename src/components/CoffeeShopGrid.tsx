'use client'

import { useState, useEffect } from 'react'
import CoffeeShopCard from './CoffeeShopCard'
import { getCafesFromSupabase, Cafe } from '@/lib/data'

interface CoffeeShopGridProps {
  filters: any
  maxCols?: {
    '2xl'?: number
    xl?: number
    lg?: number
  }
}

export default function CoffeeShopGrid({ filters, maxCols }: CoffeeShopGridProps) {
  const [allCafes, setAllCafes] = useState<any[]>([])
  const [filteredCafes, setFilteredCafes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all cafes from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await getCafesFromSupabase()
        
        // Map Supabase Cafe schema to the structure expected by the grid and card components
        const mapped = data.map((cafe, index) => ({
          id: index + 1,
          name: cafe.name,
          location: cafe.location,
          image: cafe.image || '/placeholder-cafe-1.jpg',
          ratings: {
            overall: cafe.stats.total || 4.0,
            price: cafe.stats.taste || 3.5, // map stats to match the 6-dimension ratings
            wifi: cafe.stats.vibe || 4.0,
            coffee: cafe.stats.taste || 4.0,
            noise: cafe.vibe.noise === 'Loud' ? 2.5 : cafe.vibe.noise === 'Quiet' ? 4.5 : 3.5,
            outlets: cafe.vibe.outlets === 'Abundant' ? 4.8 : cafe.vibe.outlets === 'Limited' ? 3.0 : 4.0
          },
          wifiSpeed: cafe.vibe.wifi || '30 Mbps',
          priceRange: '₱80-155',
          weather: { temp: 27, icon: cafe.status === 'Open' ? 'sunny' : 'cloudy' },
          isOpen: cafe.status === 'Open',
          crowdLevel: cafe.atmosphere || 'moderate'
        }))
        
        setAllCafes(mapped)
        setFilteredCafes(mapped)
      } catch (err) {
        console.error('Failed to load cafes for grid:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Apply filters whenever filters or allCafes list changes
  useEffect(() => {
    if (allCafes.length === 0) return

    setLoading(true)
    
    // Simulate filtering delay
    const timer = setTimeout(() => {
      let filtered = [...allCafes]

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
  }, [filters, allCafes])

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