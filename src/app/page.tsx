'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PageShell from '@/components/PageShell'
import DirectoryCard from '@/components/DirectoryCard'
import FilterStrip from '@/components/FilterStrip'
import HeroSection from '@/components/HeroSection'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useCafes } from '@/hooks/useCafes'

export default function Home() {
  const { user } = useAuth()
  const { cafesList, isLoading } = useCafes()
  const { bookmarkedIds, loadBookmarks, toggleBookmark, isBookmarked, addBookmarkIfMissing } = useBookmarks(user?.id || null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [visibleCount, setVisibleCount] = useState(4)

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')
  const [pendingBookmarkCafeId, setPendingBookmarkCafeId] = useState<string | null>(null)

  // Load bookmarks when user changes
  useEffect(() => {
    if (user) loadBookmarks(user.id)
  }, [user, loadBookmarks])

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

  // Intersection Observer for Infinite Scroll
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

  const showReset = searchQuery !== '' || selectedType !== 'ALL' || selectedCountry !== 'ALL'

  return (
    <PageShell>
      <main className="flex-grow flex flex-col">
        <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <FilterStrip 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {filteredCafes.slice(0, visibleCount).map((cafe) => (
                    <DirectoryCard 
                      key={cafe.id}
                      cafe={cafe}
                      isBookmarked={isBookmarked(cafe.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>

                {/* Infinite Scroll trigger */}
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

      <AuthModal 
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </PageShell>
  )
}
