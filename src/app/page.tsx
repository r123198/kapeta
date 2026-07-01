'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DirectoryCard from '@/components/DirectoryCard'
import { getCafesFromSupabase, Cafe } from '@/lib/data'

export default function Home() {
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(4)

  // Load bookmarks and cafes on mount
  useEffect(() => {
    async function loadData() {
      const data = await getCafesFromSupabase()
      setCafesList(data)
      setIsLoading(false)
    }
    loadData()

    const saved = localStorage.getItem('root_bookmarks')
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse bookmarks', e)
      }
    }
  }, [])

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((bId) => bId !== id)
      : [...bookmarkedIds, id]
    setBookmarkedIds(updated)
    localStorage.setItem('root_bookmarks', JSON.stringify(updated))
  }

  // Filter cafes
  const filteredCafes = cafesList.filter((cafe) => {
    const matchesSearch =
      cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cafe.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      selectedType === 'ALL' || cafe.type === selectedType

    let matchesCountry = true
    if (selectedCountry !== 'ALL') {
      if (selectedCountry === 'US') {
        matchesCountry = cafe.location.includes(', NY') || cafe.location.includes(', AR')
      } else if (selectedCountry === 'JP') {
        matchesCountry = cafe.location.includes(', JP')
      } else if (selectedCountry === 'DK') {
        matchesCountry = cafe.location.includes(', DK')
      } else if (selectedCountry === 'UK') {
        matchesCountry = cafe.location.includes(', London') || cafe.location.includes('London')
      }
    }

    return matchesSearch && matchesType && matchesCountry
  })

  // Intersection Observer for Lazy Loading (Infinite Scroll)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const bottomRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && filteredCafes.length > visibleCount) {
        setVisibleCount((prev) => prev + 4)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [isLoading, filteredCafes.length, visibleCount])

  const handleReset = () => {
    setSearchQuery('')
    setSelectedType('ALL')
    setSelectedCountry('ALL')
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-24 flex flex-col items-center justify-center text-center px-grid-margin relative overflow-hidden bg-surface border-b border-border-subtle">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#c4c7c7 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }}
          />
          <div className="z-10 flex flex-col items-center max-w-2xl">
            <h1 className="font-hanken text-[48px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter mb-4 leading-none">
              DIRECTORY
            </h1>
            <p className="font-sans text-body-lg text-secondary max-w-lg mx-auto">
              A curated selection of the finest specialty coffee spaces and independent roasters worldwide.
            </p>
          </div>
        </section>

        {/* Filter Strip */}
        <div className="border-b border-border-subtle bg-surface px-grid-margin py-4 sticky top-16 z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Left: Filter Selects */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input in filter strip */}
              <div className="relative flex items-center border border-border-subtle bg-canvas-white px-3 py-1.5 focus-within:border-primary transition-colors">
                <span className="material-symbols-outlined text-secondary text-[18px] mr-2">search</span>
                <input 
                  className="bg-transparent border-none outline-none focus:ring-0 p-0 font-sans text-body-sm w-44 md:w-56 text-on-surface placeholder:text-outline" 
                  placeholder="Search cafes or cities..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-canvas-white border border-border-subtle px-3 py-1.5 pr-8 font-mono text-label-caps text-secondary hover:text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
                >
                  <option value="ALL">TYPE: ALL</option>
                  <option value="INT">INT (Interior)</option>
                  <option value="PRO">PRO (Roaster)</option>
                  <option value="NEW">NEW (New Space)</option>
                  <option value="HM">HM (Historic)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>

              {/* Country Filter */}
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="appearance-none bg-canvas-white border border-border-subtle px-3 py-1.5 pr-8 font-mono text-label-caps text-secondary hover:text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
                >
                  <option value="ALL">COUNTRY: ALL</option>
                  <option value="US">UNITED STATES</option>
                  <option value="JP">JAPAN</option>
                  <option value="DK">DENMARK</option>
                  <option value="UK">UNITED KINGDOM</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Right: Reset Action */}
            {(searchQuery || selectedType !== 'ALL' || selectedCountry !== 'ALL') && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 cursor-pointer text-secondary hover:text-primary transition-colors font-mono text-label-caps self-start md:self-auto"
              >
                <span>Reset filters</span>
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Grid */}
        <section className="px-grid-margin py-stack-lg bg-surface-alt flex-grow">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center py-20 border border-border-subtle bg-canvas-white">
                <span className="font-mono text-label-caps text-secondary">Loading directory...</span>
              </div>
            ) : filteredCafes.length === 0 ? (
              <div className="text-center py-20 border border-border-subtle bg-canvas-white">
                <span className="material-symbols-outlined text-[48px] text-secondary mb-4">
                  local_cafe
                </span>
                <p className="font-mono text-label-caps text-secondary">No cafes match your filter criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter bg-border-subtle border border-border-subtle">
                  {filteredCafes.slice(0, visibleCount).map((cafe) => (
                    <DirectoryCard 
                      key={cafe.id}
                      cafe={cafe}
                      isBookmarked={bookmarkedIds.includes(cafe.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>

                {/* Infinite Scroll trigger element at the bottom */}
                {filteredCafes.length > visibleCount && (
                  <div ref={bottomRef} className="mt-12 py-6 flex justify-center">
                    <span className="font-mono text-label-caps text-secondary tracking-widest animate-pulse">
                      Loading more workspaces...
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
