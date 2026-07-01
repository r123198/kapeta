'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Tooltip from '@/components/Tooltip'
import AuthModal from '@/components/AuthModal'
import { getCafeFromSupabaseById, Cafe } from '@/lib/data'
import { supabase } from '@/lib/supabase'

// Dynamically load Leaflet Map component
const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex items-center justify-center font-mono text-label-caps text-secondary">
      Loading map canvas...
    </div>
  ),
})

export default function CafeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Auth Modal State
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')

  // Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Find cafe & check bookmark state
  useEffect(() => {
    async function loadData() {
      const found = await getCafeFromSupabaseById(id)
      if (found) {
        setCafe(found)
        
        // Check active session & query Supabase bookmarks
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('cafe_id', found.id)
            .maybeSingle()

          setIsBookmarked(!!bookmark)
        }
      }
      setMounted(true)
    }
    loadData()

    // Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setIsBookmarked(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [id])

  const toggleBookmark = async () => {
    if (!cafe) return
    
    if (!user) {
      // User is not logged in -> trigger Auth Modal
      setAuthModalTab('login')
      setIsAuthModalOpen(true)
      return
    }

    try {
      if (isBookmarked) {
        // Delete bookmark from database
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('cafe_id', cafe.id)

        if (!error) {
          setIsBookmarked(false)
        }
      } else {
        // Add bookmark to database
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            cafe_id: cafe.id,
          })

        if (!error) {
          setIsBookmarked(true)
        }
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err)
    }
  }

  const handleAuthSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser)
    setIsAuthModalOpen(false)

    // Automatically toggle/save the bookmark after logging in
    if (cafe) {
      try {
        const { data: exists } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', loggedInUser.id)
          .eq('cafe_id', cafe.id)
          .maybeSingle()

        if (!exists) {
          await supabase.from('bookmarks').insert({
            user_id: loggedInUser.id,
            cafe_id: cafe.id,
          })
        }
        setIsBookmarked(true)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Resolve mock phone, email, socials fallback based on cafe ID
  const getSocials = (cafeId: string) => {
    const fallbacks: Record<string, { phone: string; email: string; instagram: string; facebook: string }> = {
      'sey-coffee': {
        phone: '+1 (347) 878-8400',
        email: 'info@seycoffee.com',
        instagram: '@seycoffee',
        facebook: 'facebook.com/seycoffee'
      },
      'onyx-coffee-lab': {
        phone: '+1 (479) 715-6492',
        email: 'info@onyxcoffeelab.com',
        instagram: '@onyxcoffeelab',
        facebook: 'facebook.com/onyxcoffeelab'
      },
      'kurasu': {
        phone: '+81 75-222-5077',
        email: 'co-op@kurasu.kyoto',
        instagram: '@kurasu.kyoto',
        facebook: 'facebook.com/kurasukyoto'
      },
      'la-cabra': {
        phone: '+45 88 44 14 00',
        email: 'webshop@lacabra.dk',
        instagram: '@lacabra.coffee',
        facebook: 'facebook.com/lacabracoffee'
      },
      'ozone-coffee-roasters': {
        phone: '+44 20 7490 9710',
        email: 'london@ozonecoffee.co.uk',
        instagram: '@ozonecoffeeroasters',
        facebook: 'facebook.com/ozonecoffeeroasters'
      },
      'prufrock-coffee': {
        phone: '+44 20 7242 7467',
        email: 'info@prufrockcoffee.com',
        instagram: '@prufrockcoffee',
        facebook: 'facebook.com/prufrockcoffee'
      },
      'watchhouse': {
        phone: '+44 20 7407 6599',
        email: 'bermondsey@watchhouse.com',
        instagram: '@watchhouse',
        facebook: 'facebook.com/watchhouse'
      }
    }
    return fallbacks[cafeId] || {
      phone: '+63 917 123 4567',
      email: `hello@${cafeId}.com`,
      instagram: `@${cafeId}`,
      facebook: `facebook.com/${cafeId}`
    }
  }

  if (!mounted) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="font-mono text-label-caps text-secondary">Loading profile...</span>
        </div>
        <Footer />
      </div>
    )
  }

  if (!cafe) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary mb-4">
            warning
          </span>
          <h1 className="font-hanken text-headline-lg font-bold text-primary mb-2">Workspace Not Found</h1>
          <p className="font-sans text-body-lg text-secondary mb-8">
            The workspace profile you requested does not exist.
          </p>
          <Link 
            href="/"
            className="font-mono text-label-caps border border-primary px-6 py-3 text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            Back to Directory
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Resolve multiple images from comma-separated string
  const images = cafe.image ? cafe.image.split(',').map((img) => img.trim()) : []
  if (images.length === 1) {
    // Add beautiful secondary placeholders for demonstration
    images.push(
      'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop'
    )
  }

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const socials = getSocials(cafe.id)

  return (
    <div className="min-h-screen text-on-surface bg-[#EDEDED] flex flex-col font-sans">
      <Navbar />

      {/* Main Canvas */}
      <main className="flex-grow flex flex-col items-center p-4 md:p-grid-margin max-w-6xl w-full mx-auto gap-4">
        
        {/* Mobile Header Back Button */}
        <div className="w-full md:hidden flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1 font-mono text-label-caps text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
        </div>

        {/* Image Slider Gallery */}
        <div className="w-full bg-canvas-white border border-border-subtle shadow-sm relative h-64 sm:h-80 md:h-96 overflow-hidden group/gallery">
          <img 
            className="w-full h-full object-cover transition-all duration-500 ease-in-out" 
            src={images[activeImageIndex]} 
            alt={`${cafe.name} - View ${activeImageIndex + 1}`} 
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

          {/* Slider Controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-canvas-white/80 hover:bg-canvas-white text-primary p-2 rounded-full border border-border-subtle shadow-sm transition-all opacity-0 group-hover/gallery:opacity-100 z-10 flex items-center justify-center"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-canvas-white/80 hover:bg-canvas-white text-primary p-2 rounded-full border border-border-subtle shadow-sm transition-all opacity-0 group-hover/gallery:opacity-100 z-10 flex items-center justify-center"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/45 backdrop-blur-sm px-3 py-1 rounded-full">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeImageIndex ? 'bg-canvas-white w-4' : 'bg-canvas-white/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title & Mobile Actions Strip */}
        <div className="w-full bg-canvas-white border border-border-subtle p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h1 className="font-hanken text-[32px] md:text-headline-lg font-bold text-primary uppercase tracking-tighter leading-none">
              {cafe.name}
            </h1>
            <p className="font-mono text-label-caps text-secondary mt-1">{cafe.location}</p>
          </div>
          
          <button 
            onClick={toggleBookmark}
            className="md:hidden py-3 px-6 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest w-full sm:w-auto"
          >
            <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-fill' : ''}`}>
              {isBookmarked ? 'bookmark' : 'bookmark_add'}
            </span>
            {isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
          </button>
        </div>

        {/* Split Grid */}
        <div className="w-full flex flex-col md:flex-row gap-[1px] bg-border-subtle border border-border-subtle shadow-sm">
          
          {/* Left Column: Review & Location Map */}
          <div className="flex-grow flex-1 bg-canvas-white flex flex-col min-w-0">
            {/* Editorial Review */}
            <article className="p-6 md:p-stack-lg border-b border-border-subtle">
              <h2 className="font-hanken text-title-md text-primary mb-3 font-semibold uppercase tracking-wider">
                Editorial Note
              </h2>
              <div className="font-sans text-body-lg text-on-surface-variant space-y-4 leading-relaxed">
                <p>{cafe.review}</p>
                <p>
                  Every element, from the acoustics to the lighting fixtures, is selected to cater to the sensory experience. Whether looking to work or simply sit back and enjoy, this space has been vetted for productivity and aesthetic standards.
                </p>
              </div>
            </article>

            {/* Location Map Section */}
            <section className="p-6 md:p-stack-lg">
              <h2 className="font-hanken text-title-md text-primary mb-4 font-semibold uppercase tracking-wider">
                Location Map
              </h2>
              <div className="h-80 md:h-96 w-full border border-border-subtle relative bg-surface-alt z-0">
                <LeafletMap 
                  cafes={[cafe]}
                  selectedCafe={cafe}
                  onSelectCafe={() => {}}
                />
              </div>
            </section>
          </div>

          {/* Right Column: Ratings, Details, Contact & Actions */}
          <aside className="w-full md:w-80 lg:w-96 bg-canvas-white flex flex-col shrink-0 md:sticky md:top-32 md:h-[calc(100vh-14rem)] md:overflow-y-auto no-scrollbar">
            
            {/* Desktop Action Bar */}
            <div className="hidden md:block p-4 md:p-stack-md border-b border-border-subtle sticky top-0 bg-canvas-white z-10">
              <button 
                onClick={toggleBookmark}
                className="w-full py-3.5 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest"
              >
                <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-fill' : ''}`}>
                  {isBookmarked ? 'bookmark' : 'bookmark_add'}
                </span>
                {isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
              </button>
            </div>

            {/* Quality Ratings (Stats Table Block styled exactly like Directory Card) */}
            <div className="p-6 border-b border-border-subtle">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                Specialty Scores
              </h3>
              <div className="grid grid-cols-4 border border-border-subtle divide-x divide-border-subtle text-center">
                <Tooltip content="Taste Score (0-10)">
                  <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                    <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">TST</span>
                    <span className="font-mono text-label-caps text-primary">{cafe.stats.taste.toFixed(1)}</span>
                  </div>
                </Tooltip>
                
                <Tooltip content="Vibe Score (0-10)">
                  <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                    <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">VIB</span>
                    <span className="font-mono text-label-caps text-primary">{cafe.stats.vibe.toFixed(1)}</span>
                  </div>
                </Tooltip>

                <Tooltip content="Service Score (0-10)">
                  <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                    <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">SRV</span>
                    <span className="font-mono text-label-caps text-primary">{cafe.stats.service.toFixed(1)}</span>
                  </div>
                </Tooltip>

                <Tooltip content="Total Overall Score (0-10)">
                  <div className="p-1.5 flex flex-col justify-center bg-primary text-on-primary cursor-help h-full">
                    <span className="font-mono text-[9px] tracking-widest border-b border-on-primary/30 pb-1 mb-1">TOT</span>
                    <span className="font-mono text-label-caps">{cafe.stats.total.toFixed(1)}</span>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* The Vibe Table */}
            <div className="p-6 border-b border-border-subtle">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                The Vibe
              </h3>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">WiFi</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.wifi}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Outlets</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.outlets}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Seating</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.seating}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Noise</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.noise}</div>
              </div>
            </div>

            {/* The Coffee Table */}
            <div className="p-6 border-b border-border-subtle">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                The Coffee
              </h3>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Roaster</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.roaster}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Beans</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.beans}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Espresso</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.espresso}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Filter</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.filter}</div>
              </div>
            </div>

            {/* Contact & Socials Table */}
            <div className="p-6">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                Contact & Socials
              </h3>
              <div className="space-y-3.5">
                
                {/* Website */}
                <a 
                  href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Website</span>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary group-hover/contact:underline flex items-center gap-1.5 font-medium">
                    Visit Site
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </span>
                </a>

                {/* Phone */}
                <a 
                  href={`tel:${socials.phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Phone</span>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
                    {socials.phone}
                  </span>
                </a>

                {/* Email */}
                <a 
                  href={`mailto:${socials.email}`}
                  className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Email</span>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium truncate max-w-[160px]">
                    {socials.email}
                  </span>
                </a>

                {/* Instagram */}
                <a 
                  href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Instagram</span>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
                    {socials.instagram}
                  </span>
                </a>

                {/* Facebook */}
                <a 
                  href={`https://${socials.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Facebook</span>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
                    {socials.facebook.replace('facebook.com/', '')}
                  </span>
                </a>

              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Auth Modal overlay for Guest Users */}
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
