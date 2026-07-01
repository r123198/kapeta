'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DirectoryCard from '@/components/DirectoryCard'
import FilterStrip from '@/components/FilterStrip'
import AuthModal from '@/components/AuthModal'
import { getCafesFromSupabase, Cafe } from '@/lib/data'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(4)

  // Auth & Bookmark Modal state
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')
  const [pendingBookmarkCafeId, setPendingBookmarkCafeId] = useState<string | null>(null)

  // Load cafes & session on mount
  useEffect(() => {
    async function loadData() {
      const data = await getCafesFromSupabase()
      setCafesList(data)
      setIsLoading(false)
    }
    loadData()

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserBookmarks(session.user.id)
      }
    })

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadUserBookmarks(session.user.id)
      } else {
        setUser(null)
        setBookmarkedIds([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserBookmarks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('cafe_id')
        .eq('user_id', userId)

      if (!error && data) {
        setBookmarkedIds(data.map((row: any) => row.cafe_id))
      }
    } catch (e) {
      console.error('Failed to load user bookmarks', e)
    }
  }

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // User is not logged in -> trigger Auth Modal
      setPendingBookmarkCafeId(id)
      setAuthModalTab('login')
      setIsAuthModalOpen(true)
      return
    }

    try {
      if (bookmarkedIds.includes(id)) {
        // Delete bookmark from database
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('cafe_id', id)

        if (!error) {
          setBookmarkedIds((prev) => prev.filter((bId) => bId !== id))
        }
      } else {
        // Add bookmark to database
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            cafe_id: id,
          })

        if (!error) {
          setBookmarkedIds((prev) => [...prev, id])
        }
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err)
    }
  }

  const handleAuthSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser)
    setIsAuthModalOpen(false)

    // Fetch existing bookmarks for the newly logged-in user
    await loadUserBookmarks(loggedInUser.id)

    // Save pending bookmark if set
    if (pendingBookmarkCafeId) {
      const targetId = pendingBookmarkCafeId
      setPendingBookmarkCafeId(null)
      try {
        const { data: exists } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', loggedInUser.id)
          .eq('cafe_id', targetId)
          .maybeSingle()

        if (!exists) {
          await supabase.from('bookmarks').insert({
            user_id: loggedInUser.id,
            cafe_id: targetId,
          })
          setBookmarkedIds((prev) => [...prev, targetId])
        }
      } catch (err) {
        console.error(err)
      }
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

  const showReset = searchQuery !== '' || selectedType !== 'ALL' || selectedCountry !== 'ALL'

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
          <div className="z-10 flex flex-col items-center max-w-2xl w-full">
            <h1 className="font-hanken text-[48px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter mb-4 leading-none">
               ROOT
            </h1>
            <p className="font-sans text-body-lg text-secondary max-w-lg mx-auto mb-8">
              A curated selection of the finest specialty coffee spaces and independent roasters worldwide.
            </p>

            {/* Big Prominent Search Bar */}
            <div className="w-full max-w-2xl relative flex items-center border-2 border-primary bg-canvas-white px-5 py-4 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 shadow-md">
              <span className="material-symbols-outlined text-primary text-[28px] mr-4">search</span>
              <input 
                className="bg-transparent border-none outline-none focus:ring-0 p-0 font-sans text-[18px] md:text-[22px] font-semibold w-full text-on-surface placeholder:text-outline/65" 
                placeholder="Search workspaces, cities, or roasters..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-secondary hover:text-primary transition-colors ml-2"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filter Strip */}
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
                      isBookmarked={bookmarkedIds.includes(cafe.id)}
                      onToggleBookmark={toggleBookmark}
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

      {/* Auth Modal (Triggered on bookmark click if unauthenticated) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  )
}
