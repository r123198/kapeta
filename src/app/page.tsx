'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, MapPin, LayoutGrid, Clock, Wifi, Search, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Tooltip from '@/components/Tooltip'
import { CafeDetailDrawer, CafeCurationDrawer } from '@/components/MapSidebar'
import { useCafes } from '@/hooks/useCafes'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Cafe } from '@/lib/data'

const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex flex-col items-center justify-center gap-3 font-mono text-label-caps text-secondary">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span>Loading map canvas...</span>
    </div>
  ),
})

const CDO_COORDS: [number, number] = [8.4772, 124.6459]

export default function Home() {
  const { user } = useAuth()
  const {
    loadBookmarks,
    saveCafeWithCuration,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getCuration,
  } = useBookmarks(user?.id || null)
  const { cafesList, isLoading } = useCafes()

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'WIFI'>('ALL')
  const [selectedCity, setSelectedCity] = useState<'Cagayan de Oro' | 'ALL'>('Cagayan de Oro')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [isCurationDrawerOpen, setIsCurationDrawerOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(CDO_COORDS)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (user) {
      loadBookmarks(user.id)
    }
  }, [user, loadBookmarks])

  const detectUserLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setSelectedCity('Cagayan de Oro')
        setMapCenter(CDO_COORDS)
      },
      () => {
        setSelectedCity('Cagayan de Oro')
        setMapCenter(CDO_COORDS)
      },
      { enableHighAccuracy: false, timeout: 6000 }
    )
  }, [])

  useEffect(() => {
    detectUserLocation()
  }, [detectUserLocation])

  const handleCitySelect = (city: 'Cagayan de Oro' | 'ALL') => {
    setSelectedCity(city)
    setSelectedCafe(null)
    setIsCurationDrawerOpen(false)
    setMapCenter(CDO_COORDS)
  }

  const handleSelectCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe)
    if (user) {
      setIsCurationDrawerOpen(true)
    }
  }

  // Filter cafes by city, chip filter, and search query
  const filteredCafes = cafesList.filter((cafe) => {
    const locLower = cafe.location.toLowerCase()
    if (selectedCity === 'Cagayan de Oro') {
      const isCdo =
        locLower.includes('cagayan de oro') ||
        locLower.includes('cdo') ||
        cafe.id.endsWith('-cdo') ||
        cafe.id === 'h-proper-coffee-roasters'
      if (!isCdo) return false
    }

    if (selectedFilter === 'OPEN' && cafe.status !== 'Open') return false
    if (
      selectedFilter === 'WIFI' &&
      !cafe.vibe.wifi.toLowerCase().includes('fast') &&
      !cafe.vibe.wifi.toLowerCase().includes('mbps')
    ) {
      return false
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchesName = cafe.name.toLowerCase().includes(q)
      const matchesLoc = cafe.location.toLowerCase().includes(q)
      const matchesNeighborhood = (cafe.neighborhood || '').toLowerCase().includes(q)
      const matchesRoaster = (cafe.coffee?.roaster || '').toLowerCase().includes(q)
      if (!matchesName && !matchesLoc && !matchesNeighborhood && !matchesRoaster) {
        return false
      }
    }

    return true
  })

  const filterOptions: {
    key: 'ALL' | 'OPEN' | 'WIFI'
    label: string
    tooltip: string
    Icon: typeof LayoutGrid
  }[] = [
    {
      key: 'ALL',
      label: 'All Spaces',
      tooltip: 'Show all coffee shops and roasteries on the map.',
      Icon: LayoutGrid,
    },
    {
      key: 'OPEN',
      label: 'Open Now',
      tooltip: 'Only show coffee shops that are open right now.',
      Icon: Clock,
    },
    {
      key: 'WIFI',
      label: 'High-Speed WiFi',
      tooltip: 'Only show cafes with fast WiFi for remote work.',
      Icon: Wifi,
    },
  ]

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-on-surface bg-surface font-sans">
      <Navbar />

      <main className="flex-grow flex h-full relative overflow-hidden pb-16 md:pb-0">
        {/* Left-Side Drawer: Cafe Profile Details */}
        {selectedCafe && (
          <CafeDetailDrawer
            selectedCafe={selectedCafe}
            onClose={() => setSelectedCafe(null)}
            isLoggedIn={!!user}
            isBookmarked={isBookmarked(selectedCafe.id)}
            onOpenCuration={() => setIsCurationDrawerOpen(true)}
          />
        )}

        {/* Interactive Map Area */}
        <section
          aria-label="Interactive Map"
          className="flex-grow h-full bg-surface-dim relative overflow-hidden"
        >
          {/* Top Filter Icons, Location Selector & Search Box with Tooltips */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-1.5 z-[1000] bg-canvas-white/95 backdrop-blur-sm p-1.5 border border-border-subtle shadow-sm max-w-[92vw]">
            {/* Location City Selector */}
            <Tooltip
              position="bottom"
              content="Switch between Cagayan de Oro cafes or view all spaces."
            >
              <div className="flex items-center border border-border-subtle bg-surface-alt px-2.5 h-9">
                <MapPin className="w-4 h-4 text-primary mr-1.5 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) =>
                    handleCitySelect(e.target.value as 'Cagayan de Oro' | 'ALL')
                  }
                  aria-label="Select city"
                  className="bg-transparent font-mono text-label-caps uppercase text-primary outline-none cursor-pointer pr-1"
                >
                  <option value="Cagayan de Oro">Cagayan de Oro</option>
                  <option value="ALL">All Locations</option>
                </select>
              </div>
            </Tooltip>

            {/* Compact Search Input */}
            <Tooltip
              position="bottom"
              content="Filter map markers by cafe name, street, or roaster."
            >
              <div className="hidden sm:flex items-center border border-border-subtle bg-surface-alt px-2.5 h-9 w-48 focus-within:border-primary focus-within:bg-canvas-white transition-colors">
                <Search className="w-3.5 h-3.5 text-secondary mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cafes..."
                  className="w-full bg-transparent border-none outline-none font-sans text-[12px] text-primary placeholder:text-secondary/70"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-secondary hover:text-primary ml-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Tooltip>

            {filterOptions.map(({ key, label, tooltip, Icon }) => (
              <Tooltip key={key} position="bottom" content={tooltip}>
                <button
                  type="button"
                  onClick={() => setSelectedFilter(key)}
                  aria-label={label}
                  className={`w-9 h-9 flex items-center justify-center border transition-colors ${
                    selectedFilter === key
                      ? 'bg-primary text-canvas-white border-primary'
                      : 'bg-surface-alt text-on-surface border-border-subtle hover:bg-surface-container'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </Tooltip>
            ))}
          </div>

          {isLoading ? (
            <div className="w-full h-full bg-surface-alt flex flex-col items-center justify-center gap-3 font-mono text-label-caps text-secondary">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span>Loading map data...</span>
            </div>
          ) : (
            <LeafletMap
              cafes={filteredCafes}
              selectedCafe={selectedCafe}
              onSelectCafe={handleSelectCafe}
              mapCenter={mapCenter}
              userLocation={userLocation}
              onRequestUserLocation={detectUserLocation}
              isLoggedIn={!!user}
              isBookmarked={isBookmarked}
              onToggleBookmark={(cafeId) => {
                const targetCafe = filteredCafes.find((c) => c.id === cafeId)
                if (targetCafe) {
                  setSelectedCafe(targetCafe)
                  setIsCurationDrawerOpen(true)
                } else {
                  toggleBookmark(cafeId)
                }
              }}
            />
          )}
        </section>

        {/* Right-Side Drawer: Lived Experience & Curation Form when a place is selected */}
        {selectedCafe && user && isCurationDrawerOpen && (
          <CafeCurationDrawer
            selectedCafe={selectedCafe}
            existingCuration={getCuration(selectedCafe.id)}
            isBookmarked={isBookmarked(selectedCafe.id)}
            onSaveToCollection={saveCafeWithCuration}
            onRemoveFromCollection={removeBookmark}
            onClose={() => setIsCurationDrawerOpen(false)}
          />
        )}
      </main>
    </div>
  )
}
