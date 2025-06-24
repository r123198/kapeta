'use client'

import { useState } from 'react'
import FilterSidebar from './FilterSidebar'
import CoffeeShopGrid from './CoffeeShopGrid'
import { Filter } from 'lucide-react'

export default function CoffeeShopListingSection() {
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
  const [showFilters, setShowFilters] = useState(false)

  // For demo, count is static. Replace with dynamic if needed.
  const cafeCount = 10

  // Determine maxCols for grid based on filter sidebar state
  const maxCols = showFilters ? { xl: 4, lg: 3 } : { '2xl': 5, xl: 4, lg: 3 }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Discover Coffee Shops in Iligan
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Find the perfect cafe for your remote work needs. Filter by wifi speed, coffee quality, noise level, and more.
          </p>
        </div>

        {/* Responsive layout: flex on desktop, stacked on mobile/tablet */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: filter (if open) or empty */}
          <div className={`w-full lg:w-1/4 flex-shrink-0 ${showFilters ? 'hidden lg:block' : 'hidden'}`}>
            {showFilters && (
              <div className="relative">
                <button
                  className="absolute top-2 right-2 z-10 text-muted hover:text-foreground"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  ×
                </button>
                <FilterSidebar onFiltersChange={setFilters} />
              </div>
            )}
          </div>

          {/* Main grid area: stretches to full width if filter is off */}
          <div className={`w-full ${showFilters ? 'lg:w-3/4' : 'lg:w-full'}`}>
            {/* Section title and cafe count/filter button row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 sm:mb-0">
                Coffee Shops in Iligan
              </h2>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-muted">{cafeCount} cafes found</span>
                <button
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-accent/90 transition-colors"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-5 h-5" />
                  Filter
                </button>
              </div>
            </div>
            <CoffeeShopGrid filters={filters} maxCols={maxCols} />
          </div>
        </div>

        {/* Filter Modal (mobile/tablet) */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 lg:hidden">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto relative shadow-lg">
              <button
                className="absolute top-3 right-3 text-muted hover:text-foreground"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                ×
              </button>
              <FilterSidebar onFiltersChange={setFilters} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 