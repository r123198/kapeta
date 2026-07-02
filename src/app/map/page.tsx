'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import MapSidebar from '@/components/MapSidebar'
import { useCafes } from '@/hooks/useCafes'
import { Cafe } from '@/lib/data'

const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex items-center justify-center font-mono text-label-caps text-secondary">
      Loading map canvas...
    </div>
  ),
})

export default function MapPage() {
  const { cafesList, isLoading } = useCafes()
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'WIFI'>('ALL')
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  
  // Auto-select first cafe after loading
  useEffect(() => {
    if (!isLoading && cafesList.length > 0 && !selectedCafe) {
      const ozone = cafesList.find((c) => c.id === 'ozone-coffee-roasters') || cafesList[0]
      setSelectedCafe(ozone)
    }
  }, [isLoading, cafesList, selectedCafe])

  // Filter map markers
  const filteredCafes = cafesList.filter((cafe) => {
    if (selectedFilter === 'OPEN') return cafe.status === 'Open'
    if (selectedFilter === 'WIFI') return cafe.vibe.wifi.toLowerCase().includes('fast')
    return true
  })

  const filterOptions: { key: 'ALL' | 'OPEN' | 'WIFI'; label: string }[] = [
    { key: 'ALL', label: 'All Spaces' },
    { key: 'OPEN', label: 'Open Now' },
    { key: 'WIFI', label: 'High-Speed WiFi' },
  ]

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-on-surface bg-surface font-sans">
      <Navbar />

      <main className="flex-grow flex h-full relative overflow-hidden pb-16 md:pb-0">
        
        {/* Interactive Map Area */}
        <section aria-label="Interactive Map" className="flex-grow h-full bg-surface-dim relative overflow-hidden">
          {/* Filter Chips */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-[1000] bg-canvas-white/95 backdrop-blur-sm p-1.5 border border-border-subtle shadow-sm">
            {filterOptions.map((opt) => (
              <button 
                key={opt.key}
                onClick={() => setSelectedFilter(opt.key)}
                className={`px-3 py-1.5 font-mono text-label-caps uppercase border transition-colors ${
                  selectedFilter === opt.key 
                    ? 'bg-primary text-canvas-white border-primary' 
                    : 'bg-surface-alt text-on-surface border-border-subtle hover:bg-surface-container'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="w-full h-full bg-surface-alt flex items-center justify-center font-mono text-label-caps text-secondary">
              Loading map data...
            </div>
          ) : (
            <LeafletMap 
              cafes={filteredCafes}
              selectedCafe={selectedCafe}
              onSelectCafe={setSelectedCafe}
            />
          )}
        </section>

        {/* Sidebar + Mobile Bottom Sheet */}
        {selectedCafe && (
          <MapSidebar 
            selectedCafe={selectedCafe}
            onClose={() => setSelectedCafe(null)}
          />
        )}
      </main>
    </div>
  )
}
