'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import PageShell from '@/components/PageShell'
import ImageGallery from '@/components/ImageGallery'
import CafeDetailSidebar from '@/components/CafeDetailSidebar'
import AuthModal from '@/components/AuthModal'
import { getCafeFromSupabaseById, getSocials, Cafe } from '@/lib/data'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'

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
  
  const { user } = useAuth()
  const { loadBookmarks, toggleBookmark, isBookmarked, addBookmarkIfMissing } = useBookmarks(user?.id || null)

  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [mounted, setMounted] = useState(false)

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')

  // Load cafe & bookmarks
  useEffect(() => {
    async function loadData() {
      const found = await getCafeFromSupabaseById(id)
      if (found) setCafe(found)
      setMounted(true)
    }
    loadData()
  }, [id])

  // Sync bookmarks when user becomes available
  useEffect(() => {
    if (user) loadBookmarks(user.id)
  }, [user, loadBookmarks])

  const handleToggleBookmark = async () => {
    if (!cafe) return
    
    if (!user) {
      setAuthModalTab('login')
      setIsAuthModalOpen(true)
      return
    }

    await toggleBookmark(cafe.id)
  }

  const handleAuthSuccess = async (loggedInUser: any) => {
    setIsAuthModalOpen(false)
    await loadBookmarks(loggedInUser.id)

    if (cafe) {
      await addBookmarkIfMissing(cafe.id)
    }
  }

  if (!mounted) {
    return (
      <PageShell>
        <div className="flex-grow flex items-center justify-center">
          <span className="font-mono text-label-caps text-secondary">Loading profile...</span>
        </div>
      </PageShell>
    )
  }

  if (!cafe) {
    return (
      <PageShell>
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
      </PageShell>
    )
  }

  // Resolve multiple images from comma-separated string
  const images = cafe.image ? cafe.image.split(',').map((img) => img.trim()) : []
  if (images.length === 1) {
    images.push(
      'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop'
    )
  }

  const socials = getSocials(cafe.id)
  const bookmarked = isBookmarked(cafe.id)

  return (
    <PageShell className="bg-[#EDEDED]">
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

        {/* Image Gallery */}
        <ImageGallery images={images} altPrefix={cafe.name} />

        {/* Title & Mobile Actions Strip */}
        <div className="w-full bg-canvas-white border border-border-subtle p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h1 className="font-hanken text-[32px] md:text-headline-lg font-bold text-primary uppercase tracking-tighter leading-none">
              {cafe.name}
            </h1>
            <p className="font-mono text-label-caps text-secondary mt-1">{cafe.location}</p>
          </div>
          
          <button 
            onClick={handleToggleBookmark}
            className="md:hidden py-3 px-6 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest w-full sm:w-auto"
          >
            <span className={`material-symbols-outlined text-[18px] ${bookmarked ? 'material-symbols-fill' : ''}`}>
              {bookmarked ? 'bookmark' : 'bookmark_add'}
            </span>
            {bookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
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

          {/* Right Column */}
          <CafeDetailSidebar 
            cafe={cafe}
            socials={socials}
            isBookmarked={bookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
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
