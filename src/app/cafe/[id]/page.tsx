'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2, AlertTriangle, ArrowLeft, Bookmark, Sparkles, Plus } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ImageGallery from '@/components/ImageGallery'
import CafeDetailSidebar from '@/components/CafeDetailSidebar'
import AuthModal from '@/components/AuthModal'
import { getCafeFromSupabaseById, getSocials, Cafe } from '@/lib/data'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { getShopGimmicks, getShopIdentity, addShopGimmick, ShopGimmick, ShopIdentity } from '@/lib/ownerStudio'
import { getNewsArticles, addNewsArticle, canUserModerateCafe, NewsArticle } from '@/lib/adminStore'

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
  
  const { user, role } = useAuth()
  const { loadBookmarks, toggleBookmark, isBookmarked, addBookmarkIfMissing } = useBookmarks(user?.id || null)

  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [cafeNews, setCafeNews] = useState<NewsArticle[]>([])
  const [identity, setIdentity] = useState<ShopIdentity | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [postType, setPostType] = useState<'event' | 'news'>('event')
  const [postTitle, setPostTitle] = useState('')
  const [postDesc, setPostDesc] = useState('')

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
        setCafeNews(getNewsArticles().filter((a) => a.cafeId === found.id))
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
    <PageShell className="bg-surface-alt">
      <main className="flex-grow flex flex-col items-center p-4 md:p-grid-margin max-w-6xl w-full mx-auto gap-4">
        
        {/* Back Button */}
        <div className="w-full flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 font-mono text-label-caps uppercase text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Image Gallery */}
        <ImageGallery images={images} altPrefix={cafe.name} />

        {/* Title & Actions Strip */}
        <div className="w-full bg-canvas-white border border-border-subtle p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-hanken text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight">
              {cafe.name}
            </h1>
            <p className="font-sans text-body-sm text-secondary mt-1">
              {cafe.neighborhood || cafe.location}
              {cafe.hours ? ` · ${cafe.hours}` : ''}
            </p>
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

            {/* Simplified Live Shop Events & News Section */}
            {(gimmicks.length > 0 || cafeNews.length > 0 || canUserModerateCafe(user?.email, role, cafe.id)) && (
              <section className="p-6 md:p-stack-lg border-b border-border-subtle bg-amber-50/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-hanken text-title-md text-primary font-bold">
                    Live Shop Events &amp; News
                  </h2>
                  {canUserModerateCafe(user?.email, role, cafe.id) && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-canvas-white font-sans text-xs font-medium hover:opacity-90 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showAddForm ? 'Cancel' : 'Add News / Live Event'}
                    </button>
                  )}
                </div>

                {showAddForm && canUserModerateCafe(user?.email, role, cafe.id) && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!postTitle.trim() || !postDesc.trim()) return
                      if (postType === 'event') {
                        addShopGimmick({
                          cafeId: cafe.id,
                          title: postTitle.trim(),
                          category: 'Community Pop-Up',
                          schedule: 'Live Event',
                          description: postDesc.trim(),
                        })
                      } else {
                        addNewsArticle({
                          title: postTitle.trim(),
                          subtitle: postDesc.trim(),
                          category: 'Promo & Perk',
                          locationArea: 'Corrales & Lifestyle District',
                          cafeId: cafe.id,
                          cafeName: cafe.name,
                          author: `${cafe.name} Moderator`,
                          readTime: '1 min read',
                          image: cafe.image,
                          body: [postDesc.trim()],
                        })
                      }
                      setGimmicks(getShopGimmicks(cafe.id))
                      setCafeNews(getNewsArticles().filter((a) => a.cafeId === cafe.id))
                      setPostTitle('')
                      setPostDesc('')
                      setShowAddForm(false)
                    }}
                    className="mb-4 p-4 bg-canvas-white border border-border-subtle space-y-3"
                  >
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPostType('event')}
                        className={`px-3 py-1.5 text-xs font-sans font-medium border cursor-pointer ${
                          postType === 'event'
                            ? 'bg-primary text-canvas-white border-primary'
                            : 'bg-surface-alt text-secondary border-border-subtle'
                        }`}
                      >
                        Live Event
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostType('news')}
                        className={`px-3 py-1.5 text-xs font-sans font-medium border cursor-pointer ${
                          postType === 'news'
                            ? 'bg-primary text-canvas-white border-primary'
                            : 'bg-surface-alt text-secondary border-border-subtle'
                        }`}
                      >
                        Cafe News / Promo
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Heading"
                      className="w-full px-3 py-2 border border-border-subtle font-sans text-sm text-primary focus:outline-none focus:border-primary"
                    />
                    <textarea
                      rows={2}
                      required
                      value={postDesc}
                      onChange={(e) => setPostDesc(e.target.value)}
                      placeholder="Short description..."
                      className="w-full px-3 py-2 border border-border-subtle font-sans text-sm text-primary focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 text-white font-sans text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                    >
                      Publish
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {gimmicks.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 bg-canvas-white border border-border-subtle space-y-1"
                    >
                      <h3 className="font-hanken text-base font-bold text-primary">
                        {g.title}
                      </h3>
                      <p className="font-sans text-sm text-secondary leading-relaxed">
                        {g.description}
                      </p>
                    </div>
                  ))}
                  {cafeNews.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 bg-canvas-white border border-border-subtle space-y-1"
                    >
                      <h3 className="font-hanken text-base font-bold text-primary">
                        {n.title}
                      </h3>
                      <p className="font-sans text-sm text-secondary leading-relaxed">
                        {n.subtitle}
                      </p>
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
