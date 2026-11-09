'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2, AlertTriangle, ArrowLeft, Bookmark, Megaphone, Sparkles, Calendar } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ImageGallery from '@/components/ImageGallery'
import CafeDetailSidebar from '@/components/CafeDetailSidebar'
import AuthModal from '@/components/AuthModal'
import { getCafeFromSupabaseById, getSocials, Cafe } from '@/lib/data'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { getShopGimmicks, getShopIdentity, ShopGimmick, ShopIdentity } from '@/lib/ownerStudio'

// Dynamically load Leaflet Map component
const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex flex-col items-center justify-center gap-3 font-mono text-label-caps text-secondary">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      <span>Loading map canvas...</span>
    </div>
  ),
})

export default function CafeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const { user } = useAuth()
  const { loadBookmarks, toggleBookmark, isBookmarked, addBookmarkIfMissing } = useBookmarks(user?.id || null)

  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [identity, setIdentity] = useState<ShopIdentity | null>(null)
  const [mounted, setMounted] = useState(false)

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')

  // Load cafe & bookmarks
  useEffect(() => {
    async function loadData() {
      const found = await getCafeFromSupabaseById(id)
      if (found) {
        setCafe(found)
        setGimmicks(getShopGimmicks(found.id))
        setIdentity(getShopIdentity(found.id))
      }
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
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-mono text-label-caps text-secondary">Loading profile...</span>
        </div>
      </PageShell>
    )
  }

  if (!cafe) {
    return (
      <PageShell>
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertTriangle className="w-12 h-12 text-secondary mb-4" />
          <h1 className="font-hanken text-headline-lg font-bold text-primary mb-2">Workspace Not Found</h1>
          <p className="font-sans text-body-lg text-secondary mb-8">
            The workspace profile you requested does not exist.
          </p>
          <Link 
            href="/"
            className="font-mono text-label-caps border border-primary px-6 py-3 text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            Back to Map
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
            <ArrowLeft className="w-4 h-4" />
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
          
          {user && (
            <button 
              onClick={handleToggleBookmark}
              className="md:hidden py-3 px-6 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest w-full sm:w-auto"
            >
              <Bookmark className={`w-[18px] h-[18px] ${bookmarked ? 'fill-current' : ''}`} />
              {bookmarked ? 'Saved to Directory' : 'Save to Directory'}
            </button>
          )}
        </div>

        {/* Split Grid */}
        <div className="w-full flex flex-col md:flex-row gap-[1px] bg-border-subtle border border-border-subtle shadow-sm">
          
          {/* Left Column: Review & Location Map */}
          <div className="flex-grow flex-1 bg-canvas-white flex flex-col min-w-0">
            {/* Editorial Review */}
            <article className="p-6 md:p-stack-lg border-b border-border-subtle">
              {identity && (
                <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 font-mono text-[10px] uppercase tracking-wider text-amber-900 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{identity.signatureConcept}</span>
                </div>
              )}
              <h2 className="font-hanken text-title-md text-primary mb-3 font-semibold uppercase tracking-wider">
                Editorial Note &amp; Mission
              </h2>
              <div className="font-sans text-body-lg text-on-surface-variant space-y-4 leading-relaxed">
                <p>{cafe.review}</p>
                {identity?.missionVision && (
                  <p className="italic text-secondary border-l-2 border-emerald-600 pl-3">
                    &ldquo;{identity.missionVision}&rdquo;
                  </p>
                )}
              </div>
            </article>

            {/* Shop Happenings & Gimmicks Section */}
            {gimmicks.length > 0 && (
              <section className="p-6 md:p-stack-lg border-b border-border-subtle bg-amber-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-hanken text-title-md text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-700" />
                    <span>Shop Happenings &amp; Gimmicks</span>
                  </h2>
                  <Link
                    href="/studio"
                    className="font-mono text-[10px] uppercase tracking-wider text-amber-900 underline"
                  >
                    Manage in Shop Studio →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {gimmicks.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 bg-canvas-white border border-amber-200 border-l-4 border-l-amber-600 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono text-[9px] uppercase font-bold">
                          {g.category}
                        </span>
                        <span className="font-mono text-[10px] text-secondary flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {g.schedule}
                        </span>
                      </div>
                      <h3 className="font-hanken text-body-lg font-bold text-primary">
                        {g.title}
                      </h3>
                      <p className="font-sans text-body-sm text-secondary leading-relaxed">
                        {g.description}
                      </p>
                      {g.perkOrHighlight && (
                        <p className="inline-block font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5">
                          ★ {g.perkOrHighlight}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

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
            isLoggedIn={!!user}
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
