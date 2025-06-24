'use client'

import { useState } from 'react'
import { Search, Plus, ChevronDown } from 'lucide-react'
import RatingBar from './RatingBar'

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void
}

export default function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    overall: 0,
    price: 0,
    wifi: 0,
    coffee: 0,
    noise: 0,
    outlets: 0,
    search: '',
    location: 'All Iligan Areas'
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: number | string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const locations = [
    'All Iligan Areas',
    'City Center',
    'Tibanga',
    'University Area',
    'Palao',
    'Mahayahay',
    'Tambo'
  ]

  return (
    <div className="lg:sticky lg:top-8 h-fit">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search coffee shops..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Location Dropdown */}
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Rating Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <Plus className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                Advanced
              </button>
            </div>

            <RatingBar
              label="Overall"
              rating={filters.overall}
              icon="🏆"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.overall}
              onChange={(e) => handleFilterChange('overall', parseFloat(e.target.value))}
              className="w-full"
            />

            <RatingBar
              label="Price Range"
              rating={filters.price}
              icon="💰"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.price}
              onChange={(e) => handleFilterChange('price', parseFloat(e.target.value))}
              className="w-full"
            />

            <RatingBar
              label="Wifi Speed"
              rating={filters.wifi}
              icon="📶"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.wifi}
              onChange={(e) => handleFilterChange('wifi', parseFloat(e.target.value))}
              className="w-full"
            />

            <RatingBar
              label="Coffee Quality"
              rating={filters.coffee}
              icon="☕"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.coffee}
              onChange={(e) => handleFilterChange('coffee', parseFloat(e.target.value))}
              className="w-full"
            />

            <RatingBar
              label="Noise Level"
              rating={filters.noise}
              icon="🔇"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.noise}
              onChange={(e) => handleFilterChange('noise', parseFloat(e.target.value))}
              className="w-full"
            />

            <RatingBar
              label="Power Outlets"
              rating={filters.outlets}
              icon="⚡"
              showValue={false}
            />
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.outlets}
              onChange={(e) => handleFilterChange('outlets', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              const clearedFilters = {
                overall: 0,
                price: 0,
                wifi: 0,
                coffee: 0,
                noise: 0,
                outlets: 0,
                search: '',
                location: 'All Iligan Areas'
              }
              setFilters(clearedFilters)
              onFiltersChange(clearedFilters)
            }}
            className="w-full py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  )
} 