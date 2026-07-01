'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCafesFromSupabase, Cafe } from '@/lib/data'
import { supabase } from '@/lib/supabase'

export default function BookmarksPage() {
  const router = useRouter()
  
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOfflineOnly, setFilterOfflineOnly] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [sessionUser, setSessionUser] = useState<any>(null)

  // Load bookmarks & cafes on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          // If not logged in, redirect to login
          router.push('/login')
          return
        }
        
        setSessionUser(session.user)
        
        // Fetch cafes
        const cafes = await getCafesFromSupabase()
        setCafesList(cafes)
        
        // Fetch user's bookmarks from Supabase
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('cafe_id')
          .eq('user_id', session.user.id)

        if (!bookmarksError && bookmarksData) {
          setBookmarkedIds(bookmarksData.map((row: any) => row.cafe_id))
        }

        setMounted(true)
      } catch (err) {
        console.error('Failed to load bookmarks page data:', err)
        router.push('/login')
      }
    }
    loadData()
  }, [])

  const removeBookmark = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!sessionUser) return

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', sessionUser.id)
        .eq('cafe_id', id)

      if (!error) {
        const updated = bookmarkedIds.filter((bId) => bId !== id)
        setBookmarkedIds(updated)
      } else {
        console.error('Failed to delete bookmark in Supabase', error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Get resolved bookmarked cafes
  const bookmarkedCafes = cafesList.filter((cafe) => bookmarkedIds.includes(cafe.id))

  // Filter saved list
  const filteredBookmarks = bookmarkedCafes.filter((cafe) => {
    const matchesSearch =
      cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cafe.location.toLowerCase().includes(searchQuery.toLowerCase())

    const isOffline = cafe.id === 'ozone-coffee-roasters' || cafe.id === 'sey-coffee' // Simulated offline availability
    const matchesOffline = !filterOfflineOnly || isOffline

    return matchesSearch && matchesOffline
  })

  // Simulated status logic
  const isOfflineAvailable = (id: string) => {
    // Sey Coffee and Ozone are simulated offline
    return id === 'ozone-coffee-roasters' || id === 'sey-coffee'
  }

  if (!mounted) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="font-mono text-label-caps text-secondary">Verifying session...</span>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Header Strip */}
        <div className="bg-canvas-white border-b border-border-subtle py-6 flex items-center justify-between px-grid-margin shrink-0 z-10 w-full">
          <div className="flex items-center gap-4 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-hanken text-title-md md:text-headline-lg font-bold text-primary tracking-tight">
                Saved Spaces
              </h2>
              <span className="font-mono text-label-caps text-secondary bg-surface-alt px-2.5 py-1 border border-border-subtle">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            
            {/* Quick stats */}
            <div className="hidden sm:flex items-center gap-2 text-secondary font-mono text-[10px] uppercase tracking-wider">
              <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
              <span>Offline Ready</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <section className="px-grid-margin py-8 w-full max-w-7xl mx-auto flex-grow">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                search
              </span>
              <input 
                className="w-full pl-9 pr-4 py-2 border border-border-subtle bg-canvas-white font-sans text-body-sm text-primary placeholder-secondary focus:border-primary focus:ring-0 transition-colors rounded-none" 
                placeholder="Search bookmarks..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterOfflineOnly(false)}
                className={`px-3 py-1.5 border font-mono text-label-caps transition-colors ${
                  !filterOfflineOnly 
                    ? 'border-primary bg-canvas-white text-primary' 
                    : 'border-border-subtle bg-surface-alt text-secondary hover:bg-canvas-white hover:text-primary'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterOfflineOnly(true)}
                className={`px-3 py-1.5 border font-mono text-label-caps transition-colors ${
                  filterOfflineOnly 
                    ? 'border-primary bg-canvas-white text-primary' 
                    : 'border-border-subtle bg-surface-alt text-secondary hover:bg-canvas-white hover:text-primary'
                }`}
              >
                Available Offline
              </button>
            </div>
          </div>

          {/* Archival List View */}
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-20 border border-border-subtle bg-canvas-white">
              <span className="material-symbols-outlined text-[48px] text-secondary mb-4">
                bookmarks
              </span>
              <p className="font-mono text-label-caps text-secondary">
                {bookmarkedCafes.length === 0 
                  ? 'Your saved spaces list is empty.' 
                  : 'No saved spaces matches your query.'}
              </p>
              {bookmarkedCafes.length === 0 && (
                <Link 
                  href="/" 
                  className="mt-6 inline-block font-mono text-label-caps border border-primary px-6 py-2.5 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                >
                  Discover Cafes
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-border-subtle border border-border-subtle flex flex-col gap-[1px] shadow-sm overflow-hidden">
              
              {/* Table Header (Desktop Only) */}
              <div className="hidden md:flex bg-surface-alt px-6 py-3 items-center font-mono text-label-caps text-secondary select-none">
                <div className="w-16">Preview</div>
                <div className="flex-grow flex-1">Entity Name & Details</div>
                <div className="w-48">Location</div>
                <div className="w-32 text-right">Status</div>
                <div className="w-16 text-right">Action</div>
              </div>

              {/* List Rows */}
              {filteredBookmarks.map((cafe) => {
                const isOffline = isOfflineAvailable(cafe.id)
                return (
                  <div 
                    key={cafe.id} 
                    className="bg-canvas-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-surface-alt transition-colors"
                  >
                    {/* Left details */}
                    <div className="flex items-start md:items-center gap-4 flex-grow flex-1 min-w-0">
                      {/* Image Preview */}
                      <div className="w-12 h-12 md:w-10 md:h-10 shrink-0 border border-border-subtle overflow-hidden">
                        <img 
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity" 
                          src={cafe.image} 
                          alt={cafe.name} 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="min-w-0 pr-6">
                        <h3 className="font-hanken text-title-md text-primary mb-0.5 group-hover:underline decoration-1 underline-offset-4 font-semibold">
                          <Link href={`/cafe/${cafe.id}`}>{cafe.name}</Link>
                        </h3>
                        <p className="font-sans text-body-sm text-secondary line-clamp-1">
                          {cafe.review || 'No description available.'}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="w-full md:w-48 font-sans text-body-sm text-secondary md:block flex justify-between border-t md:border-t-0 pt-2 md:pt-0 border-border-subtle">
                      <span className="font-mono text-[9px] text-secondary uppercase md:hidden tracking-wider">Location</span>
                      <span>{cafe.location}</span>
                    </div>

                    {/* Offline/Online status */}
                    <div className="w-full md:w-32 flex md:justify-end items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-border-subtle">
                      <span className="font-mono text-[9px] text-secondary uppercase md:hidden tracking-wider">Storage</span>
                      <div className="flex items-center gap-2 ml-auto md:ml-0">
                        <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-primary' : 'bg-secondary-container'}`} />
                        <span className="font-mono text-label-caps text-primary">
                          {isOffline ? 'Offline' : 'Online'}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="w-full md:w-16 flex md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-border-subtle">
                      <button 
                        onClick={(e) => removeBookmark(cafe.id, e)}
                        className="text-secondary hover:text-error transition-colors flex items-center gap-2 md:gap-0 ml-auto md:ml-0"
                        title="Remove Bookmark"
                        aria-label="Remove bookmark"
                      >
                        <span className="font-mono text-[10px] uppercase md:hidden">Remove</span>
                        <span className="material-symbols-outlined text-[20px]">
                          bookmark_remove
                        </span>
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
