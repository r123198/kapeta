'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DirectoryCard from '@/components/DirectoryCard'
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
  
  // Modal Form state
  const [modalName, setModalName] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

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
      setModalError('')
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

  // Handle Inline Auth Modal Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalLoading(true)

    try {
      if (authModalTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: modalEmail,
          password: modalPassword,
        })

        if (error) {
          setModalError(error.message)
        } else if (data.user) {
          handleAuthSuccess(data.user)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: modalEmail,
          password: modalPassword,
          options: {
            data: {
              full_name: modalName,
              role: 'user', // Default role for average joe
            },
          },
        })

        if (error) {
          setModalError(error.message)
        } else if (data.user) {
          alert('Account successfully registered! Please log in.')
          setAuthModalTab('login')
        }
      }
    } catch (err: any) {
      setModalError(err.message || 'Authentication error.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleAuthSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser)
    setIsAuthModalOpen(false)
    setModalEmail('')
    setModalPassword('')
    setModalName('')

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
               ROOT
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
              {/* Search input */}
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
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#00000033] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas-white border border-primary w-full max-w-md p-8 flex flex-col shadow-lg relative animate-fade-in-up">
            
            {/* Close Modal */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Tab Headers */}
            <div className="flex gap-4 border-b border-border-subtle pb-3 mb-6 select-none">
              <button 
                onClick={() => { setAuthModalTab('login'); setModalError(''); }}
                className={`font-mono text-label-caps pb-1 border-b-2 transition-all ${
                  authModalTab === 'login' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthModalTab('register'); setModalError(''); }}
                className={`font-mono text-label-caps pb-1 border-b-2 transition-all ${
                  authModalTab === 'register' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary'
                }`}
              >
                Register
              </button>
            </div>

            {/* Header Text */}
            <div className="mb-6">
              <h3 className="font-hanken text-title-md font-bold text-primary">
                {authModalTab === 'login' ? 'Authentication Required' : 'Create an Account'}
              </h3>
              <p className="font-sans text-body-sm text-secondary">
                {authModalTab === 'login' 
                  ? 'Please sign in to save your favorite coffee workspaces.' 
                  : 'Join ROOT as an Average Joe and start bookmarking spaces!'}
              </p>
            </div>

            {modalError && (
              <div className="bg-error-container border border-error text-error p-3 mb-4 font-mono text-[11px] uppercase">
                {modalError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModalTab === 'register' && (
                <div>
                  <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-name">
                    Full Name
                  </label>
                  <input 
                    className="archival-input" 
                    id="modal-name" 
                    placeholder="John Doe" 
                    required 
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-email">
                  Email Address
                </label>
                <input 
                  className="archival-input" 
                  id="modal-email" 
                  placeholder="name@domain.com" 
                  required 
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-password">
                  Password
                </label>
                <input 
                  className="archival-input" 
                  id="modal-password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="archival-btn-primary w-full disabled:opacity-50"
                >
                  {modalLoading ? 'Processing...' : authModalTab === 'login' ? 'Sign In' : 'Register Account'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
