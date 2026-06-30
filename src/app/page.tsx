'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
  };

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
              {/* Search input in filter strip for desktop/tablet */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter bg-border-subtle border border-border-subtle">
                {filteredCafes.slice(0, visibleCount).map((cafe) => (
                  <article key={cafe.id} className="bg-canvas-white flex flex-col group relative overflow-hidden">
                    {/* Card Image Area */}
                    <div className="aspect-[4/3] w-full bg-surface-container-high relative overflow-hidden border-b border-border-subtle">
                      <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105" 
                        src={cafe.image}
                        alt={cafe.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-4 left-4 bg-canvas-white text-primary font-mono text-label-caps px-2 py-1 border border-border-subtle">
                        {cafe.type}
                      </div>
                      
                      {/* Save/Bookmark Button Overlay */}
                      <button
                        onClick={(e) => toggleBookmark(cafe.id, e)}
                        className="absolute top-4 right-4 bg-canvas-white text-primary p-2 border border-border-subtle hover:bg-surface-alt transition-colors z-10"
                        aria-label="Save workspace"
                      >
                        <span className={`material-symbols-outlined text-[18px] ${bookmarkedIds.includes(cafe.id) ? 'material-symbols-fill text-primary' : 'text-secondary'}`}>
                          bookmark
                        </span>
                      </button>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h2 className="font-hanken text-title-md text-primary mb-1 group-hover:underline decoration-1 underline-offset-4">
                        <Link href={`/cafe/${cafe.id}`}>{cafe.name}</Link>
                      </h2>
                      
                      <div className="flex justify-between items-center py-3 border-y border-border-subtle mt-2 mb-4">
                        <span className="font-mono text-label-caps text-secondary">Location</span>
                        <span className="font-sans text-body-sm text-primary">{cafe.location}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 mb-auto">
                        <span className="font-mono text-label-caps text-secondary">Website</span>
                        <a 
                          className="font-sans text-body-sm text-primary hover:underline underline-offset-4 decoration-border-subtle hover:decoration-primary transition-all" 
                          href={`https://${cafe.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cafe.website}
                        </a>
                      </div>

                      {/* Stats Table Block */}
                      <div className="mt-4 pt-4 border-t border-border-subtle">
                        <div className="grid grid-cols-4 border border-border-subtle divide-x divide-border-subtle text-center">
                          <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest">
                            <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1" title="Taste Score">TST</span>
                            <span className="font-mono text-label-caps text-primary">{cafe.stats.taste.toFixed(1)}</span>
                          </div>
                          <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest">
                            <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1" title="Vibe Score">VIB</span>
                            <span className="font-mono text-label-caps text-primary">{cafe.stats.vibe.toFixed(1)}</span>
                          </div>
                          <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest">
                            <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1" title="Service Score">SRV</span>
                            <span className="font-mono text-label-caps text-primary">{cafe.stats.service.toFixed(1)}</span>
                          </div>
                          <div className="p-1.5 flex flex-col justify-center bg-primary text-on-primary">
                            <span className="font-mono text-[9px] tracking-widest border-b border-on-primary/30 pb-1 mb-1" title="Total Curated Score">TOT</span>
                            <span className="font-mono text-label-caps">{cafe.stats.total.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination / Load More */}
            {filteredCafes.length > visibleCount && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="font-mono text-label-caps border border-primary px-8 py-3 text-primary hover:bg-primary hover:text-on-primary transition-colors uppercase tracking-widest"
                >
                  LOAD MORE WORKSPACES
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
