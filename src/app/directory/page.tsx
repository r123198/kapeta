'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Coffee, Plus, SlidersHorizontal } from 'lucide-react'
import PageShell from '@/components/PageShell'
import DirectoryCard from '@/components/DirectoryCard'
import FilterStrip from '@/components/FilterStrip'
import HeroSection from '@/components/HeroSection'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useCafes } from '@/hooks/useCafes'

export default function DirectoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cafesList, isLoading } = useCafes()
  const {
    bookmarkedIds,
    bookmarksLoaded,
    loadBookmarks,
    toggleBookmark,
    isBookmarked,
    getCuration,
    addBookmarkIfMissing,
  } = useBookmarks(user?.id || null)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [visibleCount, setVisibleCount] = useState(6)

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')
  const [pendingBookmarkCafeId, setPendingBookmarkCafeId] = useState<string | null>(null)

  // Require login to access the curated directory
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  // Load bookmarks when user changes
  useEffect(() => {
    if (user) {
      loadBookmarks(user.id)
    }
  }, [user, loadBookmarks])

  // Only show the user's saved/bookmarked coffee shops in their personal Directory
  const savedCafes = cafesList.filter((cafe) => bookmarkedIds.includes(cafe.id))

  // Filter saved cafes
  const filteredCafes = savedCafes.filter((cafe) => {
    const matchesType = selectedType === 'ALL' || cafe.type === selectedType

    let matchesCountry = true
    const locLower = cafe.location.toLowerCase()
    if (selectedCountry === 'CDO') {
      matchesCountry =
        locLower.includes('cagayan de oro') ||
        locLower.includes('cdo') ||
        cafe.id.endsWith('-cdo')
    }

    return matchesType && matchesCountry
  })

  // Intersection Observer for Infinite Scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const bottomRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && filteredCafes.length > visibleCount) {
          setVisibleCount((prev) => prev + 4)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, filteredCafes.length, visibleCount]
  )

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setPendingBookmarkCafeId(id)
      setAuthModalTab('login')
      setIsAuthModalOpen(true)
      return
    }

    await toggleBookmark(id)
  }

  const handleAuthSuccess = async (loggedInUser: any) => {
    setIsAuthModalOpen(false)
    await loadBookmarks(loggedInUser.id)

    if (pendingBookmarkCafeId) {
      const targetId = pendingBookmarkCafeId
      setPendingBookmarkCafeId(null)
      await addBookmarkIfMissing(targetId)
    }
  }

  const handleReset = () => {
    setSelectedType('ALL')
    setSelectedCountry('ALL')
  }

  const showReset = selectedType !== 'ALL' || selectedCountry !== 'ALL'

  if (authLoading || !user) {
    return (
      <PageShell>
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            Loading your curated directory...
          </span>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <main className="flex-grow flex flex-col relative overflow-x-hidden">
        <HeroSection />

        {/* Off-canvas Filter Drawer hidden to the side */}
        <FilterStrip
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          onReset={handleReset}
          showReset={showReset}
        />

        {/* Directory Grid */}
        <section className="px-6 md:px-12 py-12 md:py-16 bg-surface-alt flex-grow">
          <div className="max-w-7xl mx-auto">
            {isLoading || !bookmarksLoaded ? (
              <div className="flex flex-col items-center justify-center py-24 border border-border-subtle bg-canvas-white gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
                  Loading your collection...
                </span>
              </div>
            ) : savedCafes.length === 0 ? (
              <div className="text-center py-20 px-6 border border-border-subtle bg-canvas-white max-w-2xl mx-auto">
                <div className="w-14 h-14 mx-auto mb-5 bg-surface-alt border border-border-subtle flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-hanken text-headline-lg-mobile md:text-title-md font-bold text-primary mb-2">
                  No cafes in your collection yet
                </h2>
                <p className="font-sans text-body-sm md:text-body-lg text-secondary max-w-md mx-auto mb-8 leading-relaxed">
                  Your personal coffee directory is waiting for its first spot. Explore the map, tap a cafe you love, and share a few quick tags on the vibe and brew to add it here.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-canvas-white font-mono text-label-caps uppercase tracking-widest hover:bg-tertiary-container transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add your cafes</span>
                </Link>
              </div>
            ) : filteredCafes.length === 0 ? (
              <div className="text-center py-20 border border-border-subtle bg-canvas-white">
                <Coffee className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="font-mono text-label-caps text-secondary mb-4">
                  No saved cafes match your filter criteria.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-primary font-mono text-[11px] uppercase text-primary hover:bg-primary hover:text-canvas-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-label-caps text-secondary uppercase">
                    Showing {filteredCafes.length}{' '}
                    {filteredCafes.length === 1 ? 'curated spot' : 'curated spots'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(true)}
                      title="Toggle Filters"
                      aria-label="Toggle Filters"
                      className={`w-9 h-9 flex items-center justify-center border transition-colors ${
                        showReset
                          ? 'bg-primary text-canvas-white border-primary'
                          : 'bg-canvas-white text-primary border-border-subtle hover:border-primary'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-canvas-white font-mono text-[11px] uppercase tracking-wider hover:bg-tertiary-container transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add your cafes</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
                  {filteredCafes.slice(0, visibleCount).map((cafe) => (
                    <DirectoryCard
                      key={cafe.id}
                      cafe={cafe}
                      isBookmarked={isBookmarked(cafe.id)}
                      onToggleBookmark={handleToggleBookmark}
                      curation={getCuration(cafe.id)}
                    />
                  ))}
                </div>

                {/* Infinite Scroll trigger */}
                {filteredCafes.length > visibleCount && (
                  <div ref={bottomRef} className="mt-12 py-6 flex items-center justify-center gap-3">
                    <Loader2 className="w-4 h-4 text-secondary animate-spin" />
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

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </PageShell>
  )
}
