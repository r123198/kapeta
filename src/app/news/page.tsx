'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Tooltip from '@/components/Tooltip'
import { useCafes } from '@/hooks/useCafes'
import { useAuth } from '@/hooks/useAuth'
import {
  NewsArticle,
  getNewsArticles,
  addNewsArticle,
} from '@/lib/adminStore'
import { getShopGimmicks, ShopGimmick } from '@/lib/ownerStudio'
import {
  Newspaper,
  MapPin,
  Sparkles,
  Tag,
  Calendar,
  ArrowUpRight,
  Clock,
  Plus,
  X,
  Check,
  Radio,
  Search,
  Coffee,
  Compass,
  Megaphone,
  Flame,
} from 'lucide-react'

const LOCATION_MOVEMENTS: Array<{
  id: 'ALL' | NewsArticle['locationArea']
  label: string
  pulse: string
  tagline: string
}> = [
  {
    id: 'ALL',
    label: 'All City Movements',
    pulse: 'Live Across 5 Districts',
    tagline: 'Every announcement, shop gimmick, promo, and specialty coffee movement in one feed.',
  },
  {
    id: 'Downtown & Velez',
    label: 'Downtown & Velez',
    pulse: '24/7 Late-Night & Carwash Hub',
    tagline: 'Midnight coding jams, express carwash + brew bays, and heritage street corners.',
  },
  {
    id: 'Corrales & Lifestyle District',
    label: 'Corrales & Lifestyle District',
    pulse: 'Roastery Courtyards & Vinyl Nights',
    tagline: 'Weekend rapid chess brackets, single-origin flights, and coffee-by-day / bar-by-night lounges.',
  },
  {
    id: 'Nazareth & Tomas Saco',
    label: 'Nazareth & Tomas Saco',
    pulse: 'Micro-Roasters & Slow Bars',
    tagline: 'Mobile espresso cart dispatches, Japanese omakase pour-overs, and quiet neighborhood nooks.',
  },
  {
    id: 'Uptown CDO',
    label: 'Uptown CDO',
    pulse: '24/7 Study & High-Altitude Views',
    tagline: 'All-nighter cold brew flights, acoustic sunset sessions, and ridge-top workspaces.',
  },
  {
    id: 'Bukidnon Highlands',
    label: 'Bukidnon Highlands',
    pulse: 'Farm-to-Cup Origin Movement',
    tagline: 'Mt. Kitanglad & Pangantucan harvest releases, cupping tables, and producer stories.',
  },
]

const CATEGORY_FILTERS: Array<'ALL' | NewsArticle['category']> = [
  'ALL',
  'City Movement',
  'Gimmick & Event',
  'Promo & Perk',
  'Roaster Dispatch',
  'New Opening',
]

function inferLocationArea(neighborhood: string): NewsArticle['locationArea'] {
  const lower = neighborhood.toLowerCase()
  if (lower.includes('velez') || lower.includes('divisoria') || lower.includes('downtown')) {
    return 'Downtown & Velez'
  }
  if (lower.includes('corrales') || lower.includes('de leon') || lower.includes('hayes')) {
    return 'Corrales & Lifestyle District'
  }
  if (lower.includes('nazareth') || lower.includes('tomas saco')) {
    return 'Nazareth & Tomas Saco'
  }
  if (lower.includes('uptown') || lower.includes('mastersons') || lower.includes('pueblo')) {
    return 'Uptown CDO'
  }
  if (lower.includes('bukidnon') || lower.includes('kitanglad') || lower.includes('valencia')) {
    return 'Bukidnon Highlands'
  }
  return 'Corrales & Lifestyle District'
}

function getCategoryBadgeStyle(category: string) {
  switch (category) {
    case 'City Movement':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    case 'Gimmick & Event':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Promo & Perk':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'Roaster Dispatch':
      return 'bg-rose-50 text-rose-800 border-rose-200'
    case 'New Opening':
      return 'bg-sky-50 text-sky-800 border-sky-200'
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200'
  }
}

export default function NewsOutletPage() {
  const { cafesList: cafes } = useCafes()
  const { user } = useAuth()

  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [selectedArea, setSelectedArea] = useState<'ALL' | NewsArticle['locationArea']>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NewsArticle['category']>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null)
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [publishToast, setPublishToast] = useState<string | null>(null)

  // Publish form state
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formCategory, setFormCategory] = useState<NewsArticle['category']>('City Movement')
  const [formArea, setFormArea] = useState<NewsArticle['locationArea']>('Corrales & Lifestyle District')
  const [formCafeId, setFormCafeId] = useState('')
  const [formHighlightPerk, setFormHighlightPerk] = useState('')
  const [formImage, setFormImage] = useState(
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80'
  )
  const [formBodyText, setFormBodyText] = useState('')

  useEffect(() => {
    setArticles(getNewsArticles())
    setGimmicks(getShopGimmicks())
  }, [])

  // Synthesize live Shop Studio gimmicks and Cafe Promos into unified feed items
  const unifiedFeed = useMemo(() => {
    const existingIds = new Set(articles.map((a) => a.id))
    const dynamicItems: NewsArticle[] = []

    // 1. Convert custom Shop Studio gimmicks into NewsArticle items
    gimmicks.forEach((g) => {
      const syntheticId = `gimmick-news-${g.id}`
      if (existingIds.has(syntheticId)) return
      const matchedCafe = cafes.find((c) => c.id === g.cafeId)
      const cafeName = matchedCafe?.name || 'Local Specialty Shop'
      const area = matchedCafe
        ? inferLocationArea(matchedCafe.neighborhood)
        : 'Corrales & Lifestyle District'

      const isDefaultGimmick =
        g.id.startsWith('gimmick-hproper') ||
        g.id.startsWith('gimmick-bowerbird') ||
        g.id.startsWith('gimmick-maison') ||
        g.id.startsWith('gimmick-beanpark')

      if (!isDefaultGimmick) {
        dynamicItems.push({
          id: syntheticId,
          title: `${cafeName}: ${g.title}`,
          subtitle: g.description,
          category: 'Gimmick & Event',
          locationArea: area,
          cafeId: g.cafeId,
          cafeName,
          author: `${cafeName} Studio`,
          publishedAt: 'Live Shop Gimmick',
          readTime: `${g.schedule}`,
          image:
            matchedCafe?.image ||
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1000&q=80',
          body: [
            g.description,
            `Schedule & Timing: ${g.schedule} at ${cafeName} (${matchedCafe?.neighborhood || area}).`,
            g.perkOrHighlight
              ? `Special Community Perk: ${g.perkOrHighlight}`
              : 'Drop by the shop or check the interactive map for live status.',
          ],
          highlightPerk: g.perkOrHighlight,
        })
      }
    })

    // 2. Convert active Cafe Promos string into Promo & Perk dispatches
    cafes.forEach((cafe) => {
      if (!cafe.promos || !cafe.promos.trim()) return
      const promoId = `promo-news-${cafe.id}`
      if (existingIds.has(promoId)) return
      const area = inferLocationArea(cafe.neighborhood)
      dynamicItems.push({
        id: promoId,
        title: `${cafe.name} Promo & Perks`,
        subtitle: cafe.promos,
        category: 'Promo & Perk',
        locationArea: area,
        cafeId: cafe.id,
        cafeName: cafe.name,
        author: `${cafe.name} Bar Team`,
        publishedAt: 'Active Promo',
        readTime: '2 min read',
        image: cafe.image,
        body: [
          cafe.promos,
          `Where to redeem: ${cafe.name}, located at ${cafe.neighborhood}, ${cafe.location} (${area}).`,
          `Operating Hours: ${cafe.hours}. Bean Origin: ${cafe.coffee.beans}.`,
        ],
        highlightPerk: cafe.promos,
      })
    })

    return [...articles, ...dynamicItems]
  }, [articles, gimmicks, cafes])

  const filteredArticles = useMemo(() => {
    return unifiedFeed.filter((item) => {
      if (selectedArea !== 'ALL' && item.locationArea !== selectedArea) return false
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSub = item.subtitle.toLowerCase().includes(q)
        const matchCafe = (item.cafeName || '').toLowerCase().includes(q)
        const matchArea = item.locationArea.toLowerCase().includes(q)
        if (!matchTitle && !matchSub && !matchCafe && !matchArea) return false
      }
      return true
    })
  }, [unifiedFeed, selectedArea, selectedCategory, searchQuery])

  const featuredStory = useMemo(() => {
    return filteredArticles.find((a) => a.featured) || filteredArticles[0] || null
  }, [filteredArticles])

  const gridStories = useMemo(() => {
    if (!featuredStory) return []
    return filteredArticles.filter((a) => a.id !== featuredStory.id)
  }, [filteredArticles, featuredStory])

  // District pulse counts
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: unifiedFeed.length }
    LOCATION_MOVEMENTS.forEach((loc) => {
      if (loc.id !== 'ALL') {
        counts[loc.id] = unifiedFeed.filter((a) => a.locationArea === loc.id).length
      }
    })
    return counts
  }, [unifiedFeed])

  const activeAreaMeta =
    LOCATION_MOVEMENTS.find((l) => l.id === selectedArea) || LOCATION_MOVEMENTS[0]

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formSubtitle.trim()) return

    const matchedCafe = cafes.find((c) => c.id === formCafeId)
    const paragraphs = formBodyText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)

    const created = addNewsArticle({
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      category: formCategory,
      locationArea: formArea,
      cafeId: matchedCafe?.id || undefined,
      cafeName: matchedCafe?.name || undefined,
      author: user?.email ? `${user.email.split('@')[0]} (Dispatch)` : 'ROOT Editorial Desk',
      readTime: '3 min read',
      image:
        formImage.trim() ||
        matchedCafe?.image ||
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80',
      body:
        paragraphs.length > 0
          ? paragraphs
          : [
              formSubtitle.trim(),
              `Reported live from ${formArea}${matchedCafe ? ` featuring ${matchedCafe.name}` : ''}.`,
            ],
      highlightPerk: formHighlightPerk.trim() || undefined,
      featured: true,
    })

    setArticles(getNewsArticles())
    setIsPublishOpen(false)
    setFormTitle('')
    setFormSubtitle('')
    setFormHighlightPerk('')
    setFormBodyText('')
    setPublishToast(`Published "${created.title}" to the City Movement Wire!`)
    setTimeout(() => setPublishToast(null), 4000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-ink">
      <Navbar />

      {/* Top Live Ticker Bar */}
      <div className="bg-ink text-white border-b border-ink/80 px-4 sm:px-8 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 text-ink font-mono text-[10px] font-bold uppercase tracking-widest shrink-0">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE WIRE
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/85 truncate">
              CDO & Northern Mindanao Coffee Movement · Announcements, Shop Gimmicks, Tournaments & Promos
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/studio"
              className="font-mono text-[10px] uppercase tracking-widest text-amber-300 hover:text-amber-200 underline underline-offset-4"
            >
              Shop Owner? Post a Gimmick →
            </Link>
          </div>
        </div>
      </div>

      {/* Editorial Masthead */}
      <header className="border-b border-border bg-white px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink text-white font-mono text-[10px] uppercase tracking-widest">
                  <Newspaper className="w-3 h-3" /> THE ROOT DISPATCH
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  CITY COFFEE NEWS OUTLET
                </span>
                <Tooltip content="This news outlet aggregates every cafe announcement, district movement, shop gimmick (like chess tournaments or mobile carts), and active promo across the city.">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border text-[10px] font-mono text-muted hover:text-ink cursor-help">
                    ?
                  </span>
                </Tooltip>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.08]">
                City Coffee Movement & Wire
              </h1>
              <p className="mt-3 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
                Track the pulse of every neighborhood — from weekend roastery chess tournaments and
                coffee-by-day, vinyl-bars-by-night to 24/7 study hubs, carwash cafes, and single-origin
                harvest drops.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news, cafes, promos..."
                  className="w-full pl-9 pr-8 py-2.5 bg-surface border border-border font-mono text-xs text-ink placeholder:text-muted focus:outline-none focus:border-ink"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish Dispatch
              </button>
            </div>
          </div>

          {/* City / District Movement Selector */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-ink" /> FILTER BY CITY & NEIGHBORHOOD MOVEMENT
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">
                {filteredArticles.length} Dispatches Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {LOCATION_MOVEMENTS.map((loc) => {
                const isSelected = selectedArea === loc.id
                const count = areaCounts[loc.id] ?? 0
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedArea(loc.id)}
                    className={`text-left p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-white border-ink shadow-sm'
                        : 'bg-[#FAF9F6] hover:bg-white text-ink border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest font-bold truncate">
                        {loc.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 font-mono text-[9px] rounded-sm ${
                          isSelected
                            ? 'bg-emerald-400 text-ink font-bold'
                            : 'bg-white border border-border text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <p
                      className={`font-mono text-[10px] truncate ${
                        isSelected ? 'text-amber-300' : 'text-muted'
                      }`}
                    >
                      {loc.pulse}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Active District Banner + Category Pills */}
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <MapPin className="w-3.5 h-3.5 text-ink shrink-0" />
                <span>
                  <strong className="text-ink font-mono uppercase text-[11px]">
                    {activeAreaMeta.label}:
                  </strong>{' '}
                  {activeAreaMeta.tagline}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORY_FILTERS.map((cat) => {
                  const active = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-muted border-border hover:border-ink hover:text-ink'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {publishToast && (
        <div className="bg-emerald-700 text-white px-4 py-3 font-mono text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          {publishToast}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {filteredArticles.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center max-w-xl mx-auto my-8">
            <Newspaper className="w-8 h-8 text-muted mx-auto mb-3" />
            <h2 className="text-lg font-bold text-ink mb-1">
              No dispatches match this filter yet
            </h2>
            <p className="text-xs text-muted mb-6">
              Try switching to another neighborhood movement or publish a new announcement for this area.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('ALL')
                  setSelectedCategory('ALL')
                  setSearchQuery('')
                }}
                className="px-4 py-2 border border-ink font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-white transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="px-4 py-2 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 transition-colors cursor-pointer"
              >
                + Publish Dispatch
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left / Center 8 Columns: Featured Story + Editorial Grid */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Lead Dispatch */}
              {featuredStory && (
                <article
                  onClick={() => setActiveArticle(featuredStory)}
                  className="group bg-white border border-border hover:border-ink transition-all cursor-pointer overflow-hidden shadow-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-7 relative min-h-[260px] sm:min-h-[340px] bg-neutral-100 overflow-hidden">
                      <img
                        src={featuredStory.image}
                        alt={featuredStory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-ink text-white font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-300" /> FEATURED MOVEMENT
                        </span>
                        <span
                          className={`px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest font-semibold ${getCategoryBadgeStyle(
                            featuredStory.category
                          )}`}
                        >
                          {featuredStory.category}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-5 p-6 sm:p-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted mb-2.5">
                          <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{featuredStory.locationArea}</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-snug group-hover:text-emerald-800 transition-colors">
                          {featuredStory.title}
                        </h2>

                        <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed line-clamp-4">
                          {featuredStory.subtitle}
                        </p>

                        {featuredStory.highlightPerk && (
                          <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 text-amber-950">
                            <div className="font-mono text-[9px] uppercase tracking-widest text-amber-800 font-bold mb-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> COMMUNITY PERK / HIGHLIGHT
                            </div>
                            <p className="text-xs font-medium">{featuredStory.highlightPerk}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                          {featuredStory.cafeName ? (
                            <span className="text-ink font-bold">{featuredStory.cafeName}</span>
                          ) : (
                            <span>{featuredStory.author}</span>
                          )}{' '}
                          · {featuredStory.publishedAt}
                        </div>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest font-bold text-ink group-hover:translate-x-0.5 transition-transform">
                          Read Story <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* Secondary Stories Grid */}
              {gridStories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-ink">
                      Latest Dispatches & Gimmicks ({gridStories.length})
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      Click any card for full details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gridStories.map((story) => (
                      <article
                        key={story.id}
                        onClick={() => setActiveArticle(story)}
                        className="group bg-white border border-border hover:border-ink transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                      >
                        <div>
                          <div className="relative h-48 bg-neutral-100 overflow-hidden border-b border-border">
                            <img
                              src={story.image}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              <span
                                className={`px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest font-bold ${getCategoryBadgeStyle(
                                  story.category
                                )}`}
                              >
                                {story.category}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-ink/85 text-white font-mono text-[9px] uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                                {story.locationArea}
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            {story.cafeName && (
                              <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-1 flex items-center gap-1">
                                <Coffee className="w-3 h-3" /> {story.cafeName}
                              </div>
                            )}

                            <h4 className="text-base font-bold text-ink leading-snug group-hover:text-emerald-800 transition-colors">
                              {story.title}
                            </h4>

                            <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-3">
                              {story.subtitle}
                            </p>

                            {story.highlightPerk && (
                              <div className="mt-3 px-2.5 py-2 bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-[11px] font-medium flex items-start gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{story.highlightPerk}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-5 py-3 bg-[#FAF9F6] border-t border-border flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {story.publishedAt}
                          </span>
                          <span className="text-ink font-bold flex items-center gap-1">
                            Open <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Live Gimmick Wire + Active Cafe Promos */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Live Shop Gimmicks & Events Board */}
              <div className="bg-white border border-border p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-ink">
                      Live Shop Gimmicks & Events
                    </h3>
                  </div>
                  <Link
                    href="/studio"
                    className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 hover:underline"
                  >
                    + Add Yours
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {gimmicks.slice(0, 6).map((g) => {
                    const cafe = cafes.find((c) => c.id === g.cafeId)
                    const area = cafe ? inferLocationArea(cafe.neighborhood) : 'CDO District'
                    return (
                      <div
                        key={g.id}
                        className="p-3.5 bg-[#FAF9F6] border border-border hover:border-ink transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono text-[9px] uppercase tracking-widest font-bold">
                            {g.category}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                            {area}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-ink mt-1.5 leading-snug">
                          {g.title}
                        </h4>
                        <p className="text-[11px] text-muted mt-1 line-clamp-2">
                          {g.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-border/70 flex items-center justify-between font-mono text-[10px]">
                          <span className="text-ink font-semibold truncate">
                            {cafe?.name || 'Local Roastery'}
                          </span>
                          <span className="text-emerald-700 flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" /> {g.schedule.split('·')[0]}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Active Promos & Perks Board */}
              <div className="bg-white border border-border p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-ink">
                      Active Cafe Promos & Perks
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[9px] uppercase tracking-widest font-bold">
                    Verified
                  </span>
                </div>

                <div className="space-y-3">
                  {cafes
                    .filter((c) => c.promos && c.promos.trim().length > 0)
                    .slice(0, 5)
                    .map((cafe) => (
                      <Link
                        key={`${cafe.id}-promo`}
                        href={`/cafe/${cafe.id}`}
                        className="block p-3.5 border border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-1">
                          <span>{cafe.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-white border border-emerald-200">
                            {cafe.neighborhood}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-ink mt-1">{cafe.promos}</p>
                      </Link>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Story Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-white border border-ink max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72 bg-neutral-100 border-b border-border">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-white/95 border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span
                  className={`px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest font-bold ${getCategoryBadgeStyle(
                    activeArticle.category
                  )}`}
                >
                  {activeArticle.category}
                </span>
                <span className="px-2.5 py-1 bg-ink text-white font-mono text-[10px] uppercase tracking-widest">
                  {activeArticle.locationArea}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-2">
                By {activeArticle.author} · {activeArticle.publishedAt} · {activeArticle.readTime}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {activeArticle.title}
              </h2>

              <p className="mt-3 text-sm font-medium text-muted leading-relaxed border-l-2 border-ink pl-3.5">
                {activeArticle.subtitle}
              </p>

              {activeArticle.highlightPerk && (
                <div className="mt-5 p-4 bg-amber-50 border border-amber-200">
                  <div className="font-mono text-[10px] uppercase tracking-widest font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> KEY MOVEMENT PERK / HIGHLIGHT
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-ink">
                    {activeArticle.highlightPerk}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-4 text-sm text-ink/90 leading-relaxed">
                {activeArticle.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
                {activeArticle.cafeId ? (
                  <Link
                    href={`/cafe/${activeArticle.cafeId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 transition-colors"
                  >
                    Visit {activeArticle.cafeName || 'Cafe Profile'}{' '}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 transition-colors"
                  >
                    Explore on Interactive Map <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2.5 border border-border font-mono text-xs uppercase tracking-widest text-muted hover:text-ink hover:border-ink cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Dispatch Modal */}
      {isPublishOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsPublishOpen(false)}
        >
          <div
            className="bg-white border border-ink max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                  CITY COFFEE NEWSROOM
                </span>
                <h3 className="text-xl font-bold text-ink mt-0.5">
                  Publish a City Movement Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishOpen(false)}
                className="w-8 h-8 border border-border flex items-center justify-center text-muted hover:text-ink hover:border-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Weekend Rapid Chess & Pour-Over Flights Hit Corrales"
                  className="w-full px-3.5 py-2.5 border border-border text-xs font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                    City / District Area *
                  </label>
                  <select
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value as NewsArticle['locationArea'])}
                    className="w-full px-3 py-2.5 border border-border text-xs font-mono bg-white focus:outline-none focus:border-ink"
                  >
                    {LOCATION_MOVEMENTS.filter((l) => l.id !== 'ALL').map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                    Dispatch Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NewsArticle['category'])}
                    className="w-full px-3 py-2.5 border border-border text-xs font-mono bg-white focus:outline-none focus:border-ink"
                  >
                    {CATEGORY_FILTERS.filter((c) => c !== 'ALL').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Featured Coffee Shop (Optional)
                </label>
                <select
                  value={formCafeId}
                  onChange={(e) => setFormCafeId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border text-xs font-mono bg-white focus:outline-none focus:border-ink"
                >
                  <option value="">— District-Wide / Multiple Cafes —</option>
                  {cafes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Summary / Deck *
                </label>
                <input
                  type="text"
                  required
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="1-2 sentence overview of the announcement, gimmick, or promo..."
                  className="w-full px-3.5 py-2.5 border border-border text-xs font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Promo or Event Highlight Banner (Optional)
                </label>
                <input
                  type="text"
                  value={formHighlightPerk}
                  onChange={(e) => setFormHighlightPerk(e.target.value)}
                  placeholder="e.g., Free iced latte for tournament players · 20% off night drinks"
                  className="w-full px-3.5 py-2.5 border border-border text-xs font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Full Story Paragraphs
                </label>
                <textarea
                  rows={4}
                  value={formBodyText}
                  onChange={(e) => setFormBodyText(e.target.value)}
                  placeholder="Write the full announcement, schedule details, and what the community can expect..."
                  className="w-full p-3.5 border border-border text-xs font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ink font-bold mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border text-xs font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2.5 border border-border font-mono text-xs uppercase tracking-widest text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 cursor-pointer"
                >
                  Publish to News Outlet
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
