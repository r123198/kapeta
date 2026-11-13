'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Plus, X, Newspaper, Sparkles, MapPin, Pause, Play, ChevronRight, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { CafeDetailDrawer, CafeCurationDrawer } from '@/components/MapSidebar'
import { useCafes } from '@/hooks/useCafes'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Cafe, getCafeCoordinates, getDistanceKm } from '@/lib/data'
import {
  NewsArticle,
  getNewsArticles,
  addNewsArticle,
  canUserModerateCafe,
  getManagedUsers,
} from '@/lib/adminStore'
import {
  ShopGimmick,
  getShopGimmicks,
  addShopGimmick,
} from '@/lib/ownerStudio'

const LeafletMap = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-alt flex flex-col items-center justify-center gap-3 font-sans text-sm text-secondary">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span>Loading map canvas...</span>
    </div>
  ),
})

const CDO_COORDS: [number, number] = [8.4772, 124.6459]

export default function Home() {
  const { user, role } = useAuth()
  const {
    loadBookmarks,
    saveCafeWithCuration,
    removeBookmark,
    isBookmarked,
    getCuration,
  } = useBookmarks(user?.id || null)
  const { cafesList, isLoading } = useCafes()

  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [isCurationDrawerOpen, setIsCurationDrawerOpen] = useState(false)
  const [isNewsPanelOpen, setIsNewsPanelOpen] = useState(true)
  const [isCrawlPaused, setIsCrawlPaused] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(CDO_COORDS)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // News & Live Events State
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [activeStoryModal, setActiveStoryModal] = useState<{
    title: string
    description: string
    cafe?: Cafe
  } | null>(null)

  // Add News / Live Event Modal State (for Admins & Cafe Moderators)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [postType, setPostType] = useState<'news' | 'event'>('news')
  const [postCafeId, setPostCafeId] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')

  const refreshFeed = useCallback(() => {
    setArticles(getNewsArticles())
    setGimmicks(getShopGimmicks())
  }, [])

  useEffect(() => {
    refreshFeed()
  }, [refreshFeed])

  useEffect(() => {
    if (user) {
      loadBookmarks(user.id)
    }
  }, [user, loadBookmarks])

  const detectUserLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setMapCenter(coords)
      },
      () => {
        setMapCenter(CDO_COORDS)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    detectUserLocation()
  }, [detectUserLocation])

  // Show cafes based on the user's current location (within 35 km when location is enabled),
  // or fall back to all indexed cafes if none are within that radius or location is off.
  const cdoCafes = useMemo(() => {
    if (!userLocation) return cafesList

    const [userLat, userLng] = userLocation
    const nearby = cafesList
      .map((cafe) => {
        const [lat, lng] = getCafeCoordinates(cafe)
        const distKm = getDistanceKm(userLat, userLng, lat, lng)
        return {
          cafe: {
            ...cafe,
            distance: `${distKm.toFixed(1)} KM`,
          },
          distKm,
        }
      })
      .filter((entry) => entry.distKm <= 35)
      .sort((a, b) => a.distKm - b.distKm)
      .map((entry) => entry.cafe)

    return nearby.length > 0 ? nearby : cafesList
  }, [cafesList, userLocation])

  // Determine which cafes the logged-in user can moderate
  const moderatableCafes = useMemo(() => {
    if (!user) return []
    return cdoCafes.filter((c) => canUserModerateCafe(user.email, role, c.id))
  }, [user, role, cdoCafes])

  const isAdminOrModerator = useMemo(() => {
    if (!user) return false
    return canUserModerateCafe(user.email, role) || moderatableCafes.length > 0
  }, [user, role, moderatableCafes])

  // Default cafe selection for the Add Modal
  useEffect(() => {
    if (!postCafeId && moderatableCafes.length > 0) {
      if (user?.email) {
        const managedRecord = getManagedUsers().find(
          (u) => u.email.toLowerCase() === user.email?.toLowerCase()
        )
        if (managedRecord?.managedCafeId) {
          setPostCafeId(managedRecord.managedCafeId)
          return
        }
      }
      setPostCafeId(moderatableCafes[0].id)
    }
  }, [moderatableCafes, postCafeId, user])

  // Collect all cafeIds that currently have active promos, news, or live events
  const activeEventCafeIds = useMemo(() => {
    const ids = new Set<string>()
    gimmicks.forEach((g) => {
      if (g.cafeId) ids.add(g.cafeId)
    })
    articles.forEach((a) => {
      if (a.cafeId) ids.add(a.cafeId)
    })
    cdoCafes.forEach((c) => {
      if (c.promos && c.promos.trim()) ids.add(c.id)
    })
    return Array.from(ids)
  }, [gimmicks, articles, cdoCafes])

  // Top Crawl Items: Cafe Promos & Perks
  const promoCrawlItems = useMemo(() => {
    const items: Array<{
      id: string
      title: string
      description: string
      cafeId?: string
      cafeName?: string
    }> = []

    cdoCafes.forEach((c) => {
      if (c.promos && c.promos.trim()) {
        items.push({
          id: `promo-${c.id}`,
          title: c.name,
          description: c.promos,
          cafeId: c.id,
          cafeName: c.name,
        })
      }
    })

    articles.forEach((a) => {
      if (a.category === 'Promo & Perk' || a.highlightPerk) {
        items.push({
          id: `article-promo-${a.id}`,
          title: a.cafeName || a.title,
          description: a.highlightPerk || a.subtitle,
          cafeId: a.cafeId,
          cafeName: a.cafeName,
        })
      }
    })

    return items
  }, [articles, cdoCafes])

  const handleSelectCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe)
    setMapCenter(getCafeCoordinates(cafe))
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsNewsPanelOpen(false)
    }
  }

  const handleFocusCafeById = (cafeId?: string, fallbackTitle?: string, fallbackDesc?: string) => {
    if (cafeId) {
      const target = cdoCafes.find((c) => c.id === cafeId) || cafesList.find((c) => c.id === cafeId)
      if (target) {
        setSelectedCafe(target)
        setMapCenter(getCafeCoordinates(target))
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setIsNewsPanelOpen(false)
        }
        return
      }
    }
    if (fallbackTitle && fallbackDesc) {
      setActiveStoryModal({
        title: fallbackTitle,
        description: fallbackDesc,
      })
    }
  }

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postDescription.trim()) return

    const targetCafe = cdoCafes.find((c) => c.id === postCafeId)

    if (postType === 'event') {
      addShopGimmick({
        cafeId: targetCafe?.id || cdoCafes[0]?.id || 'h-proper-coffee-roasters',
        title: postTitle.trim(),
        category: 'Community Pop-Up',
        schedule: 'Live Event',
        description: postDescription.trim(),
      })
    } else {
      addNewsArticle({
        title: postTitle.trim(),
        subtitle: postDescription.trim(),
        category: 'Promo & Perk',
        locationArea: 'Corrales & Lifestyle District',
        cafeId: targetCafe?.id || undefined,
        cafeName: targetCafe?.name || undefined,
        author: user?.email ? user.email.split('@')[0] : 'Moderator',
        readTime: '1 min read',
        image:
          targetCafe?.image ||
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80',
        body: [postDescription.trim()],
      })
    }

    refreshFeed()
    setPostTitle('')
    setPostDescription('')
    setIsAddModalOpen(false)

    if (targetCafe) {
      setSelectedCafe(targetCafe)
      setMapCenter(getCafeCoordinates(targetCafe))
    }
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-on-surface bg-surface font-sans">
      <Navbar />

      {/* Horizontal Promos Crawl Bar */}
      {promoCrawlItems.length > 0 && (
        <section
          aria-label="Active Cafe Promos and Perks"
          className="w-full bg-canvas-white border-b border-border-subtle flex items-center h-9 shrink-0 z-40 select-none overflow-hidden"
        >
          {/* Left Fixed Label Badge */}
          <div className="h-full px-3.5 bg-primary text-canvas-white flex items-center gap-2 shrink-0 z-10 border-r border-border-subtle">
            <Tag className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              Promos
            </span>
          </div>

          {/* Scrolling Marquee Viewport */}
          <div className="flex-1 h-full overflow-hidden relative flex items-center">
            <div
              className={`news-crawl-track items-center h-full ${
                isCrawlPaused ? 'news-crawl-paused' : ''
              }`}
            >
              {[0, 1].map((dupIndex) => (
                <div
                  key={dupIndex}
                  aria-hidden={dupIndex === 1}
                  className="flex items-center h-full"
                >
                  {promoCrawlItems.map((item) => {
                    const isSelected = Boolean(item.cafeId && selectedCafe?.id === item.cafeId)
                    return (
                      <button
                        key={`${dupIndex}-${item.id}`}
                        type="button"
                        tabIndex={dupIndex === 1 ? -1 : 0}
                        onClick={() =>
                          handleFocusCafeById(item.cafeId, item.title, item.description)
                        }
                        className={`h-full px-4 flex items-center gap-2 border-r border-border-subtle transition-colors cursor-pointer whitespace-nowrap group ${
                          isSelected
                            ? 'bg-emerald-50/70 text-primary'
                            : 'hover:bg-surface-alt text-primary'
                        }`}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {item.title}
                        </span>
                        <span className="font-sans text-xs text-primary group-hover:underline underline-offset-2">
                          {item.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Control: Pause/Play */}
          <div className="h-full flex items-center bg-canvas-white border-l border-border-subtle shrink-0 z-10">
            <button
              type="button"
              onClick={() => setIsCrawlPaused((prev) => !prev)}
              aria-label={isCrawlPaused ? 'Resume promo crawl' : 'Pause promo crawl'}
              title={isCrawlPaused ? 'Resume crawl' : 'Pause crawl'}
              className="h-full px-3 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              {isCrawlPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </section>
      )}

      <main className="flex-grow flex h-full relative overflow-hidden pb-16 md:pb-0">
        {/* Left-Side Drawer: Selected Cafe Profile Details */}
        {selectedCafe && (
          <CafeDetailDrawer
            selectedCafe={selectedCafe}
            onClose={() => setSelectedCafe(null)}
            isLoggedIn={!!user}
            isBookmarked={isBookmarked(selectedCafe.id)}
            onOpenCuration={() => setIsCurationDrawerOpen(true)}
            canModerate={canUserModerateCafe(user?.email, role, selectedCafe.id)}
            onNewsOrEventAdded={refreshFeed}
          />
        )}

        {/* Interactive Map Area */}
        <section
          aria-label="Interactive Map"
          className="flex-grow h-full bg-surface-dim relative overflow-hidden"
        >
          {/* Floating Toggle Button when News & Events Panel is collapsed */}
          {!isNewsPanelOpen && !isCurationDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsNewsPanelOpen(true)}
              className="absolute top-5 right-5 z-[1000] px-4 py-2.5 bg-canvas-white border border-primary shadow-md flex items-center gap-2 font-sans text-xs font-semibold text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <Newspaper className="w-4 h-4 text-amber-600" />
              <span>Happenings &amp; News</span>
            </button>
          )}

          {isLoading ? (
            <div className="w-full h-full bg-surface-alt flex flex-col items-center justify-center gap-3 font-sans text-sm text-secondary">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span>Loading map data...</span>
            </div>
          ) : (
            <LeafletMap
              cafes={cdoCafes}
              selectedCafe={selectedCafe}
              onSelectCafe={handleSelectCafe}
              mapCenter={mapCenter}
              userLocation={userLocation}
              onRequestUserLocation={detectUserLocation}
              isLoggedIn={!!user}
              isBookmarked={isBookmarked}
              onToggleBookmark={(cafeId) => {
                const target = cdoCafes.find((c) => c.id === cafeId)
                if (target) {
                  setSelectedCafe(target)
                  setIsCurationDrawerOpen(true)
                }
              }}
              activeEventCafeIds={activeEventCafeIds}
            />
          )}
        </section>

        {/* Right-Side News & Live Shop Events Sidebar */}
        {isNewsPanelOpen && !isCurationDrawerOpen && (
          <aside
            aria-label="Latest News and Live Events"
            className="w-full sm:w-[340px] md:w-[360px] h-full bg-canvas-white border-l border-border-subtle z-[1050] flex flex-col shrink-0 shadow-lg overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-3 bg-canvas-white">
              <div>
                <h2 className="font-hanken text-title-md font-bold text-primary">
                  Happenings &amp; News
                </h2>
                <p className="font-sans text-xs text-secondary">
                  Select an update to focus the cafe on the map
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdminOrModerator && (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary text-canvas-white font-mono text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNewsPanelOpen(false)}
                  aria-label="Hide News Panel"
                  className="w-8 h-8 border border-border-subtle flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Section 1: Live Shop Events */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-primary">
                      Live Shop Events
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-secondary">
                    {gimmicks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {gimmicks.map((g) => {
                    const matchedCafe = cdoCafes.find((c) => c.id === g.cafeId)
                    const isSelected = selectedCafe?.id === g.cafeId
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() =>
                          handleFocusCafeById(g.cafeId, g.title, g.description)
                        }
                        className={`w-full text-left p-3 border transition-all cursor-pointer block ${
                          isSelected
                            ? 'bg-amber-50/70 border-primary'
                            : 'bg-surface-alt/50 hover:bg-surface-alt border-border-subtle hover:border-primary'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-hanken text-sm font-bold text-primary leading-snug">
                            {g.title}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        </div>
                        <p className="font-sans text-xs text-secondary mt-1 leading-relaxed line-clamp-2">
                          {g.description}
                        </p>
                        {matchedCafe && (
                          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-800">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{matchedCafe.name}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 2: Latest News */}
              <div className="pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
                    <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-primary">
                      Latest News
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-secondary">
                    {articles.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {articles.map((article) => {
                    const isSelected = article.cafeId && selectedCafe?.id === article.cafeId
                    return (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() =>
                          handleFocusCafeById(article.cafeId, article.title, article.subtitle)
                        }
                        className={`w-full text-left p-3 border transition-all cursor-pointer block ${
                          isSelected
                            ? 'bg-emerald-50/60 border-primary'
                            : 'bg-canvas-white hover:bg-surface-alt border-border-subtle hover:border-primary'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-hanken text-sm font-bold text-primary leading-snug">
                            {article.title}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        </div>
                        <p className="font-sans text-xs text-secondary mt-1 leading-relaxed line-clamp-2">
                          {article.subtitle}
                        </p>
                        {article.cafeName && (
                          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-800">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{article.cafeName}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Right-Side Drawer: Easy Experience Curation Form (Only when user clicks Curate & Save) */}
        {user && selectedCafe && isCurationDrawerOpen && (
          <CafeCurationDrawer
            selectedCafe={selectedCafe}
            existingCuration={getCuration(selectedCafe.id)}
            isBookmarked={isBookmarked(selectedCafe.id)}
            onClose={() => setIsCurationDrawerOpen(false)}
            onSaveToCollection={saveCafeWithCuration}
            onRemoveFromCollection={removeBookmark}
          />
        )}
      </main>

      {/* Modal for District-Wide Story without a single Cafe */}
      {activeStoryModal && (
        <div
          className="fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveStoryModal(null)}
        >
          <div
            className="bg-canvas-white border border-primary max-w-md w-full p-6 shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-hanken text-lg font-bold text-primary leading-snug">
                {activeStoryModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="w-7 h-7 border border-border-subtle flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              {activeStoryModal.description}
            </p>
          </div>
        </div>
      )}

      {/* Modal for Admins & Cafe Moderators to Add News or Live Events */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-canvas-white border border-primary max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-hanken text-lg font-bold text-primary">
                  Add News or Live Event
                </h3>
                <p className="font-sans text-xs text-secondary">
                  Post an announcement, promo, or live event to the map
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 border border-border-subtle flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('news')}
                    className={`py-2 px-3 text-xs font-semibold border cursor-pointer ${
                      postType === 'news'
                        ? 'bg-primary text-canvas-white border-primary'
                        : 'bg-surface-alt text-secondary border-border-subtle'
                    }`}
                  >
                    News / Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('event')}
                    className={`py-2 px-3 text-xs font-semibold border cursor-pointer ${
                      postType === 'event'
                        ? 'bg-primary text-canvas-white border-primary'
                        : 'bg-surface-alt text-secondary border-border-subtle'
                    }`}
                  >
                    Live Shop Event
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Coffee Shop on Map
                </label>
                <select
                  value={postCafeId}
                  onChange={(e) => setPostCafeId(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle bg-canvas-white text-xs text-primary focus:outline-none focus:border-primary"
                >
                  {(moderatableCafes.length > 0 ? moderatableCafes : cdoCafes).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Heading *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g., Weekend Rapid Chess & Single-Origin Flights"
                  className="w-full px-3 py-2 border border-border-subtle text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Small Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Write a brief description of the news, promo, or live event..."
                  className="w-full p-3 border border-border-subtle text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-subtle text-xs text-secondary hover:text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-canvas-white text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  Publish to Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
