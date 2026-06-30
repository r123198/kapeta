'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { getCafesFromSupabase, Cafe } from '@/lib/data'

const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex items-center justify-center font-mono text-label-caps text-secondary">
      Loading map canvas...
    </div>
  ),
})

export default function MapPage() {
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'WIFI'>('ALL')
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  
  // Load cafes from Supabase on mount
  useEffect(() => {
    async function loadData() {
      const data = await getCafesFromSupabase()
      setCafesList(data)
      setIsLoading(false)
      
      const ozone = data.find((c) => c.id === 'ozone-coffee-roasters') || data[0]
      if (ozone) {
        setSelectedCafe(ozone)
      }
    }
    loadData()
  }, [])

  // Filter map markers
  const filteredCafes = cafesList.filter((cafe) => {
    if (selectedFilter === 'OPEN') return cafe.status === 'Open'
    if (selectedFilter === 'WIFI') return cafe.vibe.wifi.toLowerCase().includes('fast')
    return true
  })

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-on-surface bg-surface font-sans">
      <Navbar />

      {/* Main Content Area: Map + Detail Sidebar */}
      <main className="flex-grow flex h-full relative overflow-hidden pb-16 md:pb-0">
        
        {/* Interactive Map Area */}
        <section aria-label="Interactive Map" className="flex-grow h-full bg-surface-dim relative overflow-hidden">
          {/* Filter Chips (Top Center) */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-[1000] bg-canvas-white/95 backdrop-blur-sm p-1.5 border border-border-subtle shadow-sm">
            <button 
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 font-mono text-label-caps uppercase border transition-colors ${
                selectedFilter === 'ALL' 
                  ? 'bg-primary text-canvas-white border-primary' 
                  : 'bg-surface-alt text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              All Spaces
            </button>
            <button 
              onClick={() => setSelectedFilter('OPEN')}
              className={`px-3 py-1.5 font-mono text-label-caps uppercase border transition-colors ${
                selectedFilter === 'OPEN' 
                  ? 'bg-primary text-canvas-white border-primary' 
                  : 'bg-surface-alt text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              Open Now
            </button>
            <button 
              onClick={() => setSelectedFilter('WIFI')}
              className={`px-3 py-1.5 font-mono text-label-caps uppercase border transition-colors ${
                selectedFilter === 'WIFI' 
                  ? 'bg-primary text-canvas-white border-primary' 
                  : 'bg-surface-alt text-on-surface border-border-subtle hover:bg-surface-container'
              }`}
            >
              High-Speed WiFi
            </button>
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

        {/* Sidebar Panel for Desktop (Slide in / static on right) */}
        {selectedCafe && (
          <aside className="hidden md:flex flex-col w-[380px] h-full bg-canvas-white border-l border-border-subtle shrink-0 transition-transform duration-300 z-20 overflow-y-auto no-scrollbar">
            {/* Sidebar Image Area */}
            <div className="relative w-full h-56 bg-surface-container shrink-0">
              <img 
                className="w-full h-full object-cover grayscale-[20%]" 
                src={selectedCafe.image} 
                alt={selectedCafe.name} 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
                }}
              />
              <button 
                className="absolute top-4 right-4 w-8 h-8 bg-canvas-white border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors"
                onClick={() => setSelectedCafe(null)}
              >
                <span className="material-symbols-outlined text-[20px] text-primary">close</span>
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-canvas-white border border-primary font-mono text-label-caps uppercase">
                {selectedCafe.status === 'Open' ? 'Open Now' : 'Closed'}
              </div>
            </div>

            {/* Sidebar Contents */}
            <div className="flex-grow flex flex-col p-6">
              {/* Title & Stats */}
              <div className="border-b border-border-subtle pb-4 mb-4">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="font-hanken text-title-md text-primary tracking-tight font-semibold">
                    {selectedCafe.name}
                  </h2>
                  <span className="font-mono text-label-caps text-secondary mt-1">
                    {selectedCafe.distance || '0.5 MI'}
                  </span>
                </div>
                <p className="font-sans text-body-sm text-secondary">{selectedCafe.location}</p>
              </div>

              {/* Highlight Box */}
              {selectedCafe.topFeature && (
                <div className="p-3 bg-surface-alt border border-border-subtle flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary">wifi</span>
                  <div>
                    <p className="font-mono text-[10px] text-secondary uppercase tracking-wider">Top Feature</p>
                    <p className="font-sans text-body-sm font-semibold text-primary">{selectedCafe.topFeature}</p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="flex flex-col border border-border-subtle divide-y divide-border-subtle mb-6">
                <div className="flex items-center px-4 py-2.5 hover:bg-surface-alt transition-colors">
                  <div className="w-1/3 font-mono text-[10px] text-secondary uppercase tracking-wider">Atmosphere</div>
                  <div className="w-2/3 font-sans text-body-sm text-primary">{selectedCafe.atmosphere || 'Minimalist'}</div>
                </div>
                <div className="flex items-center px-4 py-2.5 hover:bg-surface-alt transition-colors">
                  <div className="w-1/3 font-mono text-[10px] text-secondary uppercase tracking-wider">Outlets</div>
                  <div className="w-2/3 font-sans text-body-sm text-primary">{selectedCafe.vibe.outlets}</div>
                </div>
                <div className="flex items-center px-4 py-2.5 hover:bg-surface-alt transition-colors">
                  <div className="w-1/3 font-mono text-[10px] text-secondary uppercase tracking-wider">Seating</div>
                  <div className="w-2/3 font-sans text-body-sm text-primary">{selectedCafe.vibe.seating}</div>
                </div>
                <div className="flex items-center px-4 py-2.5 hover:bg-surface-alt transition-colors">
                  <div className="w-1/3 font-mono text-[10px] text-secondary uppercase tracking-wider">Hours</div>
                  <div className="w-2/3 font-sans text-body-sm text-primary">{selectedCafe.hours}</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                <Link 
                  href={`/cafe/${selectedCafe.id}`}
                  className="w-full py-3 bg-primary text-canvas-white font-mono text-label-caps uppercase border border-primary hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2"
                >
                  View Full Profile
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* Bottom Sheet for Mobile (Overlay) */}
        {selectedCafe && (
          <div className="md:hidden fixed inset-x-0 bottom-16 bg-canvas-white border-t border-border-subtle z-30 flex flex-col p-4 animate-fade-in-up shadow-lg">
            <div className="flex justify-between items-start mb-3 border-b border-border-subtle pb-3">
              <div>
                <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">{selectedCafe.type} • {selectedCafe.distance || '0.5 MI'}</span>
                <h3 className="font-hanken text-title-md font-bold text-primary">{selectedCafe.name}</h3>
                <p className="font-sans text-body-sm text-secondary">{selectedCafe.location}</p>
              </div>
              <button 
                onClick={() => setSelectedCafe(null)}
                className="p-1 text-secondary hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 bg-surface-alt border border-border-subtle flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">wifi</span>
                <div>
                  <span className="block font-mono text-[9px] text-secondary">WiFi</span>
                  <span className="font-sans text-[12px] font-semibold">{selectedCafe.vibe.wifi}</span>
                </div>
              </div>
              <div className="p-2 bg-surface-alt border border-border-subtle flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">power</span>
                <div>
                  <span className="block font-mono text-[9px] text-secondary">Outlets</span>
                  <span className="font-sans text-[12px] font-semibold">{selectedCafe.vibe.outlets}</span>
                </div>
              </div>
            </div>

            <Link 
              href={`/cafe/${selectedCafe.id}`}
              className="w-full py-3 bg-primary text-canvas-white font-mono text-label-caps uppercase border border-primary hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2 text-center"
            >
              View Full Profile
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
