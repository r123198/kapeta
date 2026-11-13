'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  ArrowRight,
  Clock,
  MapPin,
  Coffee,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Laptop,
  Heart,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  MessageSquareText,
} from 'lucide-react'
import Tooltip from './Tooltip'
import {
  Cafe,
  isCafeRoastery,
  isCafe24Hours,
  getCafeImages,
} from '@/lib/data'
import { CafeCuration } from '@/hooks/useBookmarks'
import {
  getShopGimmicks,
  getShopIdentity,
  addShopGimmick,
  ShopGimmick,
  ShopIdentity,
} from '@/lib/ownerStudio'
import {
  getNewsArticles,
  addNewsArticle,
  NewsArticle,
} from '@/lib/adminStore'

interface CafeDetailDrawerProps {
  selectedCafe: Cafe
  onClose: () => void
  isLoggedIn?: boolean
  isBookmarked?: boolean
  onOpenCuration?: () => void
  canModerate?: boolean
  onNewsOrEventAdded?: () => void
}

export function CafeDetailDrawer({
  selectedCafe,
  onClose,
  isLoggedIn = false,
  isBookmarked = false,
  onOpenCuration,
  canModerate = false,
  onNewsOrEventAdded,
}: CafeDetailDrawerProps) {
  const images = getCafeImages(selectedCafe)
  const [imgIdx, setImgIdx] = useState(0)
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [cafeNews, setCafeNews] = useState<NewsArticle[]>([])
  const [identity, setIdentity] = useState<ShopIdentity | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [postType, setPostType] = useState<'event' | 'news'>('event')
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')

  const isRoastery = isCafeRoastery(selectedCafe)
  const is24h = isCafe24Hours(selectedCafe)
  const isOpen = selectedCafe.status === 'Open'

  useEffect(() => {
    setImgIdx(0)
    setGimmicks(getShopGimmicks(selectedCafe.id))
    setCafeNews(getNewsArticles().filter((a) => a.cafeId === selectedCafe.id))
    setIdentity(getShopIdentity(selectedCafe.id))
    setShowAddForm(false)
  }, [selectedCafe.id])

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postDescription.trim()) return

    if (postType === 'event') {
      addShopGimmick({
        cafeId: selectedCafe.id,
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
        cafeId: selectedCafe.id,
        cafeName: selectedCafe.name,
        author: `${selectedCafe.name} Moderator`,
        readTime: '1 min read',
        image: selectedCafe.image,
        body: [postDescription.trim()],
      })
    }

    setGimmicks(getShopGimmicks(selectedCafe.id))
    setCafeNews(getNewsArticles().filter((a) => a.cafeId === selectedCafe.id))
    setPostTitle('')
    setPostDescription('')
    setShowAddForm(false)
    onNewsOrEventAdded?.()
  }

  return (
    <aside
      aria-label="Selected Cafe Details"
      className="fixed md:absolute top-16 md:top-0 left-0 bottom-16 md:bottom-0 w-full sm:w-[370px] md:w-[390px] bg-canvas-white border-r border-border-subtle z-[1100] flex flex-col shadow-xl overflow-y-auto no-scrollbar animate-fade-in-up"
    >
      {/* Image Carousel Header */}
      <div className="relative w-full h-56 bg-surface-container shrink-0 group">
        <img
          className="w-full h-full object-cover"
          src={images[imgIdx]}
          alt={`${selectedCafe.name} photo ${imgIdx + 1}`}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Collection Badge on Top-Left (Only for Logged-In Users) */}
        {isLoggedIn && (
          <div className="absolute top-4 left-4 z-20">
            <Tooltip
              position="bottom"
              content="Open the lived-experience form on the right to share what makes this cafe special and save it to your directory."
            >
              <button
                type="button"
                onClick={onOpenCuration}
                className="h-8 px-2.5 bg-canvas-white border border-border-subtle flex items-center gap-1.5 hover:bg-surface-alt transition-colors font-mono text-[10px] uppercase tracking-wider text-primary shadow-sm"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isBookmarked ? 'fill-emerald-600 text-emerald-600' : 'text-primary'
                  }`}
                />
                <span>{isBookmarked ? 'In Collection' : 'Curate & Save'}</span>
              </button>
            </Tooltip>
          </div>
        )}

        {/* Carousel Prev/Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setImgIdx((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-canvas-white/90 hover:bg-canvas-white border border-border-subtle flex items-center justify-center text-primary transition-opacity"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setImgIdx((prev) => (prev + 1) % images.length)}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-canvas-white/90 hover:bg-canvas-white border border-border-subtle flex items-center justify-center text-primary transition-opacity"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`h-1.5 transition-all ${
                    i === imgIdx ? 'w-5 bg-canvas-white' : 'w-1.5 bg-canvas-white/60'
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Close Drawer Button */}
        <button
          type="button"
          className="absolute top-4 right-4 w-8 h-8 bg-canvas-white border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors z-20"
          onClick={onClose}
          aria-label="Close cafe drawer"
        >
          <X className="w-4 h-4 text-primary" />
        </button>

            {/*Status & Type Badges */}
        <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border ${
              isOpen
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-error text-canvas-white border-error'
            }`}
          >
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
          {is24h && (
            <span className="px-2.5 py-1 bg-canvas-white text-primary border border-primary font-mono text-[10px] font-bold uppercase tracking-wider">
              24/7
            </span>
          )}
          <span className="px-2.5 py-1 bg-canvas-white/95 text-primary border border-border-subtle font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
            {isRoastery ? <Flame className="w-3 h-3 text-amber-600" /> : <Coffee className="w-3 h-3" />}
            {isRoastery ? 'Roastery' : 'Cafe'}
          </span>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-grow flex flex-col p-5 space-y-4">
        {/* Title, Address, Opening Hours */}
        <div className="border-b border-border-subtle pb-4">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h2 className="font-hanken text-title-md text-primary font-bold">
              {selectedCafe.name}
            </h2>
            {selectedCafe.distance && (
              <span className="font-mono text-label-caps text-secondary shrink-0 mt-0.5">
                {selectedCafe.distance}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-secondary font-sans text-body-sm mb-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{selectedCafe.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-mono text-[11px] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 shrink-0 text-secondary" />
            <span>{selectedCafe.hours || '8:00 AM - 9:00 PM'}</span>
          </div>
          {identity && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 font-sans text-xs font-medium text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{identity.signatureConcept}</span>
            </div>
          )}
        </div>

        {/* Editorial Snippet */}
        {selectedCafe.review && (
          <p className="font-sans text-body-sm text-on-surface-variant leading-relaxed">
            {selectedCafe.review}
          </p>
        )}

        {/* Specialty Scores with Full Readable Labels */}
        <div className="grid grid-cols-4 border border-border-subtle divide-x divide-border-subtle text-center">
          <div className="p-2 bg-surface-container-lowest">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary pb-0.5">
              Taste
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {selectedCafe.stats.taste.toFixed(1)}
            </span>
          </div>
          <div className="p-2 bg-surface-container-lowest">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary pb-0.5">
              Vibe
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {selectedCafe.stats.vibe.toFixed(1)}
            </span>
          </div>
          <div className="p-2 bg-surface-container-lowest">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary pb-0.5">
              Service
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {selectedCafe.stats.service.toFixed(1)}
            </span>
          </div>
          <div className="p-2 bg-primary text-on-primary">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-on-primary/80 pb-0.5">
              Overall
            </span>
            <span className="font-mono text-sm font-bold">
              {selectedCafe.stats.total.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Vibe & Coffee Metadata Table */}
        <div className="flex flex-col border border-border-subtle divide-y divide-border-subtle">
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider">
              WiFi
            </span>
            <span className="font-sans text-body-sm text-primary text-right">
              {selectedCafe.vibe.wifi || 'Available'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider">
              Outlets
            </span>
            <span className="font-sans text-body-sm text-primary text-right">
              {selectedCafe.vibe.outlets || 'Standard'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider">
              Seating
            </span>
            <span className="font-sans text-body-sm text-primary text-right">
              {selectedCafe.vibe.seating || 'Indoor'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider">
              Roaster
            </span>
            <span className="font-sans text-body-sm text-primary text-right">
              {selectedCafe.coffee.roaster || 'Local Roasters'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="font-mono text-[11px] text-secondary uppercase tracking-wider">
              Beans
            </span>
            <span className="font-sans text-body-sm text-primary text-right">
              {selectedCafe.coffee.beans || 'Single Origin & Blend'}
            </span>
          </div>
        </div>

        {/* Live Shop Events & News Section */}
        {(gimmicks.length > 0 || cafeNews.length > 0 || canModerate) && (
          <div className="p-3.5 bg-amber-50/40 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-primary">
                Shop Updates
              </span>
              {canModerate && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-canvas-white font-mono text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  {showAddForm ? 'Cancel' : 'Post'}
                </button>
              )}
            </div>

            {showAddForm && canModerate && (
              <form
                onSubmit={handleQuickAdd}
                className="bg-canvas-white border border-border-subtle p-3 space-y-2.5"
              >
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPostType('event')}
                    className={`flex-1 py-1.5 text-xs font-sans font-medium border cursor-pointer ${
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
                    className={`flex-1 py-1.5 text-xs font-sans font-medium border cursor-pointer ${
                      postType === 'news'
                        ? 'bg-primary text-canvas-white border-primary'
                        : 'bg-surface-alt text-secondary border-border-subtle'
                    }`}
                  >
                    Promo / News
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Headline"
                  className="w-full px-2.5 py-2 border border-border-subtle font-sans text-xs text-primary focus:outline-none focus:border-primary"
                />
                <textarea
                  rows={2}
                  required
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-2.5 py-2 border border-border-subtle font-sans text-xs text-primary focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-700 text-white font-sans text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Publish
                </button>
              </form>
            )}

            {gimmicks.slice(0, 2).map((g) => (
              <div
                key={g.id}
                className="bg-canvas-white border border-border-subtle p-2.5 space-y-0.5"
              >
                <h4 className="font-hanken text-sm font-bold text-primary leading-snug">
                  {g.title}
                </h4>
                <p className="font-sans text-xs text-secondary leading-relaxed line-clamp-2">
                  {g.description}
                </p>
              </div>
            ))}

            {cafeNews.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className="bg-canvas-white border border-border-subtle p-2.5 space-y-0.5"
              >
                <h4 className="font-hanken text-sm font-bold text-primary leading-snug">
                  {n.title}
                </h4>
                <p className="font-sans text-xs text-secondary leading-relaxed line-clamp-2">
                  {n.subtitle}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <Link
            href={`/cafe/${selectedCafe.id}`}
            className="w-full py-3 bg-primary text-canvas-white font-mono text-label-caps uppercase border border-primary hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2"
          >
            View Full Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

const COFFEE_QUALITY_OPTIONS: {
  value: CafeCuration['coffeeQuality']
  label: string
  sub: string
}[] = [
  {
    value: 'Everyday Good',
    label: 'Warm Daily Ritual',
    sub: 'Reliable cup & welcoming vibe',
  },
  {
    value: 'Specialty Great',
    label: 'Dialed-In Specialty',
    sub: 'Great baristas & balanced brew',
  },
  {
    value: 'Exceptional Brew',
    label: 'Standout Craft & Soul',
    sub: 'Unforgettable pour & company',
  },
]

const WORK_OPTIONS: {
  value: CafeCuration['workFriendly']
  label: string
  sub: string
}[] = [
  {
    value: 'Great for Deep Work',
    label: 'Deep Work Ready',
    sub: 'Fast WiFi & plenty of sockets',
  },
  {
    value: 'Casual Laptop Spot',
    label: 'Quick Creative Flow',
    sub: 'Great for 1–2 hr sessions',
  },
  {
    value: 'Best for Unplugging',
    label: 'Social & Unplugged',
    sub: 'Best for hangs, dates & events',
  },
]

const VIBE_CHIPS = [
  'Coffee by Day, Bar by Night',
  'Carwash + Coffee Hub',
  'Warm Barista Company',
  'In-House Micro-Roastery',
  'Quiet & Focused',
  'Cozy & Warm',
  '24/7 Late Night',
  'Art, Vinyl & Community',
]

const RECOMMENDATION_CHIPS = [
  'Mobile Cart for Events & Weddings',
  'Host Chess / Board Game Tournaments',
  'Coffee by Day, Cocktail Bar by Night',
  'Acoustic / Vinyl Listening Nights',
  'Brewing & Latte Art Throwdowns',
  'Run Club / Cycling Pitstop',
  'Pop-Up Market & Brand Collabs',
  'Pour Over & Signature Espresso',
]

const QUICK_NOTE_SNIPPETS = [
  'People love their company—they would fit right in doing mobile carts & events!',
  'Love the coffee-by-day and bar-by-night atmosphere.',
  'Great spot to host a weekend chess tournament or community pop-up.',
  'The carwash + specialty coffee concept fits my routine.',
]

type QuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5'

interface FormErrors {
  q1?: string
  q2?: string
  q3?: string
  q4?: string
  q5?: string
}

interface CafeCurationDrawerProps {
  selectedCafe: Cafe
  existingCuration?: CafeCuration
  isBookmarked: boolean
  onSaveToCollection: (
    cafeId: string,
    curation: Omit<CafeCuration, 'cafeId' | 'updatedAt'>
  ) => Promise<boolean>
  onRemoveFromCollection: (cafeId: string) => Promise<boolean>
  onClose: () => void
}

export function CafeCurationDrawer({
  selectedCafe,
  existingCuration,
  isBookmarked,
  onSaveToCollection,
  onRemoveFromCollection,
  onClose,
}: CafeCurationDrawerProps) {
  const [coffeeQuality, setCoffeeQuality] = useState<CafeCuration['coffeeQuality'] | null>(
    existingCuration?.coffeeQuality || null
  )
  const [workFriendly, setWorkFriendly] = useState<CafeCuration['workFriendly'] | null>(
    existingCuration?.workFriendly || null
  )
  const [vibes, setVibes] = useState<string[]>(existingCuration?.vibes || [])
  const [recommendations, setRecommendations] = useState<string[]>(
    existingCuration?.recommendations || []
  )
  const [mustOrder, setMustOrder] = useState(existingCuration?.mustOrder || '')
  const [experienceNote, setExperienceNote] = useState(
    existingCuration?.experienceNote || ''
  )

  // Accordion visibility: unanswered questions are shown (true), answered questions are hidden (false)
  const [openSections, setOpenSections] = useState<Record<QuestionKey, boolean>>({
    q1: !existingCuration?.coffeeQuality,
    q2: !existingCuration?.workFriendly,
    q3: !(existingCuration?.vibes && existingCuration.vibes.length > 0),
    q4: !(
      (existingCuration?.recommendations && existingCuration.recommendations.length > 0) ||
      existingCuration?.mustOrder
    ),
    q5: !existingCuration?.experienceNote,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [justSaved, setJustSaved] = useState(false)

  // Reset form state when switching cafes
  useEffect(() => {
    const hasQ1 = !!existingCuration?.coffeeQuality
    const hasQ2 = !!existingCuration?.workFriendly
    const hasQ3 = !!(existingCuration?.vibes && existingCuration.vibes.length > 0)
    const hasQ4 = !!(
      (existingCuration?.recommendations && existingCuration.recommendations.length > 0) ||
      existingCuration?.mustOrder
    )
    const hasQ5 = !!existingCuration?.experienceNote

    setCoffeeQuality(existingCuration?.coffeeQuality || null)
    setWorkFriendly(existingCuration?.workFriendly || null)
    setVibes(existingCuration?.vibes || [])
    setRecommendations(existingCuration?.recommendations || [])
    setMustOrder(existingCuration?.mustOrder || '')
    setExperienceNote(existingCuration?.experienceNote || '')
    setOpenSections({
      q1: !hasQ1,
      q2: !hasQ2,
      q3: !hasQ3,
      q4: !hasQ4,
      q5: !hasQ5 && !existingCuration,
    })
    setErrors({})
    setJustSaved(false)
  }, [selectedCafe.id, existingCuration])

  const isQ1Answered = coffeeQuality !== null
  const isQ2Answered = workFriendly !== null
  const isQ3Answered = vibes.length > 0
  const isQ4Answered = recommendations.length > 0 || mustOrder.trim().length >= 2
  const isQ5Answered = experienceNote.trim().length >= 3

  const answeredRequiredCount = [
    isQ1Answered,
    isQ2Answered,
    isQ3Answered,
    isQ4Answered,
  ].filter(Boolean).length

  const toggleSection = (key: QuestionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Q1: Selecting an option marks it answered and automatically hides Q1
  const handleSelectCoffeeQuality = (val: CafeCuration['coffeeQuality']) => {
    setCoffeeQuality(val)
    setErrors((prev) => ({ ...prev, q1: undefined }))
    setOpenSections((prev) => ({
      ...prev,
      q1: false,
    }))
  }

  // Q2: Selecting an option marks it answered and automatically hides Q2
  const handleSelectWorkFriendly = (val: CafeCuration['workFriendly']) => {
    setWorkFriendly(val)
    setErrors((prev) => ({ ...prev, q2: undefined }))
    setOpenSections((prev) => ({
      ...prev,
      q2: false,
    }))
  }

  // Q3: Toggle uniqueness/vibe chip (max 5)
  const handleToggleVibe = (chip: string) => {
    if (vibes.includes(chip)) {
      const next = vibes.filter((i) => i !== chip)
      setVibes(next)
    } else {
      if (vibes.length >= 5) {
        setErrors((prev) => ({ ...prev, q3: 'You can select up to 5 identity tags.' }))
        return
      }
      const next = [...vibes, chip]
      setVibes(next)
      setErrors((prev) => ({ ...prev, q3: undefined }))
    }
  }

  // Q4: Toggle owner demand / recommendation chip (max 5)
  const handleToggleRecommendation = (chip: string) => {
    if (recommendations.includes(chip)) {
      const next = recommendations.filter((i) => i !== chip)
      setRecommendations(next)
    } else {
      if (recommendations.length >= 5) {
        setErrors((prev) => ({
          ...prev,
          q4: 'You can select up to 5 demand ideas.',
        }))
        return
      }
      const next = [...recommendations, chip]
      setRecommendations(next)
      setErrors((prev) => ({ ...prev, q4: undefined }))
    }
  }

  const handleAppendSnippet = (snippet: string) => {
    setExperienceNote((prev) => {
      const next = !prev.trim()
        ? snippet
        : prev.includes(snippet)
        ? prev
        : `${prev.trim()} ${snippet}`
      return next.slice(0, 280)
    })
    setErrors((prev) => ({ ...prev, q5: undefined }))
  }

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {}
    const nextOpen = { ...openSections }

    if (!coffeeQuality) {
      nextErrors.q1 = 'Please select how the coffee & hospitality felt.'
      nextOpen.q1 = true
    } else {
      nextOpen.q1 = false
    }

    if (!workFriendly) {
      nextErrors.q2 = 'Please select how you used the space.'
      nextOpen.q2 = true
    } else {
      nextOpen.q2 = false
    }

    if (vibes.length === 0) {
      nextErrors.q3 = 'Please pick at least 1 uniqueness or concept tag.'
      nextOpen.q3 = true
    } else {
      nextOpen.q3 = false
    }

    const trimmedOrder = mustOrder.trim()
    if (recommendations.length === 0 && trimmedOrder.length === 0) {
      nextErrors.q4 =
        'Please pick at least 1 idea for what they should do next (or enter a go-to order).'
      nextOpen.q4 = true
    } else if (trimmedOrder.length > 0 && trimmedOrder.length < 2) {
      nextErrors.q4 = 'Input must be at least 2 characters.'
      nextOpen.q4 = true
    } else if (trimmedOrder.length > 80) {
      nextErrors.q4 = 'Input must be 80 characters or fewer.'
      nextOpen.q4 = true
    } else {
      nextOpen.q4 = false
    }

    const trimmedNote = experienceNote.trim()
    if (trimmedNote.length > 0 && trimmedNote.length < 3) {
      nextErrors.q5 = 'Lived story must be at least 3 characters (or leave blank).'
      nextOpen.q5 = true
    } else if (trimmedNote.length > 280) {
      nextErrors.q5 = 'Lived story must be 280 characters or fewer.'
      nextOpen.q5 = true
    } else {
      nextOpen.q5 = false
    }

    setErrors(nextErrors)
    setOpenSections(nextOpen)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setJustSaved(false)

    if (!validateForm() || !coffeeQuality || !workFriendly) {
      return
    }

    await onSaveToCollection(selectedCafe.id, {
      coffeeQuality,
      workFriendly,
      vibes,
      recommendations,
      mustOrder: mustOrder.trim() || undefined,
      experienceNote: experienceNote.trim() || undefined,
    })

    // Collapse all questions once answered & saved
    setOpenSections({
      q1: false,
      q2: false,
      q3: false,
      q4: false,
      q5: false,
    })
    setJustSaved(true)
  }

  const hasValidationErrors = Object.values(errors).some(Boolean)

  return (
    <aside
      aria-label="Share Lived Experience and Add Cafe to Collection"
      className="fixed md:absolute top-16 md:top-0 right-0 bottom-16 md:bottom-0 w-full sm:w-[400px] md:w-[440px] bg-canvas-white border-l border-border-subtle z-[1100] flex flex-col shadow-xl overflow-hidden animate-fade-in-up"
    >
      {/* Top Header */}
      <div className="p-5 border-b border-border-subtle bg-canvas-white shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
                  isBookmarked
                    ? 'bg-emerald-700 text-white'
                    : 'bg-primary text-canvas-white'
                }`}
              >
                {isBookmarked ? 'In Your Collection' : 'Lived Experience'}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                  answeredRequiredCount === 4
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                    : 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                }`}
              >
                {answeredRequiredCount}/4 Answered
              </span>
            </div>
            <h2 className="font-hanken text-title-md font-bold text-primary">
              {selectedCafe.name}
            </h2>
            <p className="font-sans text-xs text-secondary mt-0.5">
              Curate your visit and share feedback with the shop.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-canvas-white border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors shrink-0"
            aria-label="Close curation drawer"
          >
            <X className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Mini Progress Bar */}
        <div className="w-full h-1.5 bg-surface-alt mt-3 overflow-hidden border border-border-subtle">
          <div
            className={`h-full transition-all duration-300 ${
              answeredRequiredCount === 4 ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
            style={{ width: `${(answeredRequiredCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Scrollable Accordion Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex-grow flex flex-col overflow-y-auto no-scrollbar"
      >
        <div className="divide-y divide-border-subtle flex-grow">
          {/* Validation Summary Banner */}
          {hasValidationErrors && (
            <div className="p-3.5 bg-error/10 border-b border-error/30 flex items-start gap-2.5 text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] uppercase tracking-wider leading-relaxed">
                Please complete the highlighted unanswered questions before saving.
              </p>
            </div>
          )}

          {/* ACCORDION 1: Craft & Hospitality (Required) */}
          <div
            className={`transition-colors border-l-4 ${
              isQ1Answered
                ? 'border-l-emerald-600 bg-emerald-50/30'
                : errors.q1
                ? 'border-l-error bg-error/5'
                : 'border-l-amber-500 bg-canvas-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('q1')}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-surface-alt/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono border shrink-0 transition-colors ${
                    isQ1Answered
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : errors.q1
                      ? 'border-error text-white bg-error'
                      : 'border-amber-300 text-amber-800 bg-amber-50 font-bold'
                  }`}
                >
                  {isQ1Answered ? <Check className="w-3 h-3 stroke-[2.5]" /> : '1'}
                </span>
                <Coffee
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isQ1Answered ? 'text-emerald-700' : 'text-primary'
                  }`}
                />
                <span className="font-sans text-xs font-semibold text-primary truncate">
                  Craft &amp; Barista Company
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isQ1Answered && !openSections.q1 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-mono text-[9px] uppercase text-emerald-800 font-semibold">
                    {COFFEE_QUALITY_OPTIONS.find((o) => o.value === coffeeQuality)?.label ||
                      coffeeQuality}
                  </span>
                )}
                {openSections.q1 ? (
                  <ChevronUp className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
              </div>
            </button>

            {openSections.q1 && (
              <div className="px-5 pb-4 pt-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {COFFEE_QUALITY_OPTIONS.map((opt) => {
                    const active = coffeeQuality === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectCoffeeQuality(opt.value)}
                        className={`p-2.5 text-left border transition-all flex flex-col justify-between ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-canvas-white text-primary border-border-subtle hover:border-amber-500 hover:bg-amber-50/30'
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold uppercase leading-tight">
                          {opt.label}
                        </span>
                        <span
                          className={`font-sans text-[11px] mt-1 leading-tight ${
                            active ? 'text-emerald-50' : 'text-secondary'
                          }`}
                        >
                          {opt.sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.q1 && (
                  <p className="font-mono text-[10px] text-error uppercase tracking-wider">
                    {errors.q1}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 2: How You Lived the Space (Required) */}
          <div
            className={`transition-colors border-l-4 ${
              isQ2Answered
                ? 'border-l-emerald-600 bg-emerald-50/30'
                : errors.q2
                ? 'border-l-error bg-error/5'
                : 'border-l-amber-500 bg-canvas-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('q2')}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-surface-alt/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono border shrink-0 transition-colors ${
                    isQ2Answered
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : errors.q2
                      ? 'border-error text-white bg-error'
                      : 'border-amber-300 text-amber-800 bg-amber-50 font-bold'
                  }`}
                >
                  {isQ2Answered ? <Check className="w-3 h-3 stroke-[2.5]" /> : '2'}
                </span>
                <Laptop
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isQ2Answered ? 'text-emerald-700' : 'text-primary'
                  }`}
                />
                <span className="font-sans text-xs font-semibold text-primary truncate">
                  How You Used the Space
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isQ2Answered && !openSections.q2 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-mono text-[9px] uppercase text-emerald-800 font-semibold">
                    {WORK_OPTIONS.find((o) => o.value === workFriendly)?.label || workFriendly}
                  </span>
                )}
                {openSections.q2 ? (
                  <ChevronUp className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
              </div>
            </button>

            {openSections.q2 && (
              <div className="px-5 pb-4 pt-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {WORK_OPTIONS.map((opt) => {
                    const active = workFriendly === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectWorkFriendly(opt.value)}
                        className={`p-2.5 text-left border transition-all flex flex-col justify-between ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-canvas-white text-primary border-border-subtle hover:border-amber-500 hover:bg-amber-50/30'
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold uppercase leading-tight">
                          {opt.label}
                        </span>
                        <span
                          className={`font-sans text-[11px] mt-1 leading-tight ${
                            active ? 'text-emerald-50' : 'text-secondary'
                          }`}
                        >
                          {opt.sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.q2 && (
                  <p className="font-mono text-[10px] text-error uppercase tracking-wider">
                    {errors.q2}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 3: Uniqueness & Concept Identity (Required) */}
          <div
            className={`transition-colors border-l-4 ${
              isQ3Answered
                ? 'border-l-emerald-600 bg-emerald-50/30'
                : errors.q3
                ? 'border-l-error bg-error/5'
                : 'border-l-amber-500 bg-canvas-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('q3')}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-surface-alt/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono border shrink-0 transition-colors ${
                    isQ3Answered
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : errors.q3
                      ? 'border-error text-white bg-error'
                      : 'border-amber-300 text-amber-800 bg-amber-50 font-bold'
                  }`}
                >
                  {isQ3Answered ? <Check className="w-3 h-3 stroke-[2.5]" /> : '3'}
                </span>
                <Sparkles
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isQ3Answered ? 'text-emerald-700' : 'text-primary'
                  }`}
                />
                <span className="font-sans text-xs font-semibold text-primary truncate">
                  Uniqueness &amp; Concept
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isQ3Answered && !openSections.q3 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-mono text-[9px] uppercase text-emerald-800 font-semibold max-w-[130px] truncate">
                    {vibes.join(', ')}
                  </span>
                )}
                {openSections.q3 ? (
                  <ChevronUp className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
              </div>
            </button>

            {openSections.q3 && (
              <div className="px-5 pb-4 pt-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-secondary uppercase">
                    Tap 1–5 tags that capture their identity, vibe, or concept
                  </span>
                  {isQ3Answered && (
                    <button
                      type="button"
                      onClick={() => setOpenSections((prev) => ({ ...prev, q3: false }))}
                      className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Done ({vibes.length})</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {VIBE_CHIPS.map((chip) => {
                    const selected = vibes.includes(chip)
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleVibe(chip)}
                        className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                          selected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-canvas-white text-primary border-border-subtle hover:border-amber-500 hover:bg-amber-50/30'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-emerald-200" />}
                        <span>{chip}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.q3 && (
                  <p className="font-mono text-[10px] text-error uppercase tracking-wider">
                    {errors.q3}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 4: What Should They Do Next? (Owner Demand Signals) (Required) */}
          <div
            className={`transition-colors border-l-4 ${
              isQ4Answered
                ? 'border-l-emerald-600 bg-emerald-50/30'
                : errors.q4
                ? 'border-l-error bg-error/5'
                : 'border-l-amber-500 bg-canvas-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('q4')}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-surface-alt/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono border shrink-0 transition-colors ${
                    isQ4Answered
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : errors.q4
                      ? 'border-error text-white bg-error'
                      : 'border-amber-300 text-amber-800 bg-amber-50 font-bold'
                  }`}
                >
                  {isQ4Answered ? <Check className="w-3 h-3 stroke-[2.5]" /> : '4'}
                </span>
                <Heart
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isQ4Answered ? 'text-emerald-700' : 'text-primary'
                  }`}
                />
                <span className="font-sans text-xs font-semibold text-primary truncate">
                  What Should They Do Next?
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isQ4Answered && !openSections.q4 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-mono text-[9px] uppercase text-emerald-800 font-semibold max-w-[130px] truncate">
                    {mustOrder.trim() || recommendations.join(', ')}
                  </span>
                )}
                {openSections.q4 ? (
                  <ChevronUp className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
              </div>
            </button>

            {openSections.q4 && (
              <div className="px-5 pb-4 pt-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-secondary uppercase">
                    Demand signals for the shop owner (e.g. mobile carts, tournaments, night bar)
                  </span>
                  {isQ4Answered && (
                    <button
                      type="button"
                      onClick={() => setOpenSections((prev) => ({ ...prev, q4: false }))}
                      className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Done</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {RECOMMENDATION_CHIPS.map((chip) => {
                    const selected = recommendations.includes(chip)
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleRecommendation(chip)}
                        className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                          selected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-canvas-white text-primary border-border-subtle hover:border-amber-500 hover:bg-amber-50/30'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-emerald-200" />}
                        <span>{chip}</span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={80}
                    value={mustOrder}
                    onChange={(e) => {
                      setMustOrder(e.target.value)
                      if (errors.q4) setErrors((prev) => ({ ...prev, q4: undefined }))
                    }}
                    placeholder="Specific pitch or favorite drink? e.g. 'Do wedding mobile carts!' or 'Sea Salt Latte'"
                    className="w-full px-3 py-2 border border-border-subtle bg-canvas-white focus:border-emerald-600 outline-none font-sans text-body-sm text-primary placeholder:text-secondary/70"
                  />
                </div>

                {errors.q4 && (
                  <p className="font-mono text-[10px] text-error uppercase tracking-wider">
                    {errors.q4}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 5: Lived Story for the Owners (Optional) */}
          <div
            className={`transition-colors border-l-4 ${
              isQ5Answered
                ? 'border-l-emerald-600 bg-emerald-50/30'
                : errors.q5
                ? 'border-l-error bg-error/5'
                : 'border-l-border-subtle bg-canvas-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection('q5')}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-surface-alt/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono border shrink-0 transition-colors ${
                    isQ5Answered
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : errors.q5
                      ? 'border-error text-white bg-error'
                      : 'border-border-subtle text-secondary bg-surface-alt'
                  }`}
                >
                  {isQ5Answered ? <Check className="w-3 h-3 stroke-[2.5]" /> : '5'}
                </span>
                <MessageSquareText
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isQ5Answered ? 'text-emerald-700' : 'text-primary'
                  }`}
                />
                <span className="font-sans text-xs font-semibold text-primary truncate">
                  Lived Story{' '}
                  <span className="text-secondary font-normal">(Optional)</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isQ5Answered && !openSections.q5 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-mono text-[9px] uppercase text-emerald-800 font-semibold max-w-[120px] truncate">
                    Added
                  </span>
                )}
                {openSections.q5 ? (
                  <ChevronUp className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                )}
              </div>
            </button>

            {openSections.q5 && (
              <div className="px-5 pb-4 pt-1 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_NOTE_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet}
                      type="button"
                      onClick={() => handleAppendSnippet(snippet)}
                      className="px-2 py-1 bg-surface-alt hover:bg-amber-50 hover:border-amber-300 border border-border-subtle font-sans text-[11px] text-secondary hover:text-amber-900 transition-colors text-left"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  maxLength={280}
                  value={experienceNote}
                  onChange={(e) => {
                    setExperienceNote(e.target.value)
                    if (errors.q5) setErrors((prev) => ({ ...prev, q5: undefined }))
                  }}
                  placeholder="Share a lived moment or why this cafe fits right into your life..."
                  className="w-full px-3 py-2 border border-border-subtle bg-canvas-white focus:border-emerald-600 outline-none font-sans text-body-sm text-primary placeholder:text-secondary/70 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-secondary">
                    {experienceNote.trim().length}/280 chars
                  </span>
                  {isQ5Answered && (
                    <button
                      type="button"
                      onClick={() => setOpenSections((prev) => ({ ...prev, q5: false }))}
                      className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Done</span>
                    </button>
                  )}
                </div>
                {errors.q5 && (
                  <p className="font-mono text-[10px] text-error uppercase tracking-wider">
                    {errors.q5}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmation Banner when saved */}
          {justSaved && (
            <div className="p-4 bg-emerald-50 border-t border-emerald-300 flex items-center justify-between gap-3 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-900 font-bold">
                  Saved to collection &amp; shared with owner!
                </span>
              </div>
              <Link
                href="/directory"
                className="px-3 py-1.5 bg-emerald-700 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-emerald-800 transition-colors shrink-0"
              >
                View Directory →
              </Link>
            </div>
          )}
        </div>

        {/* Sticky Footer Submit */}
        <div className="p-4 bg-canvas-white border-t border-border-subtle shrink-0 flex flex-col gap-2">
          <button
            type="submit"
            className={`w-full py-3.5 font-mono text-label-caps uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              answeredRequiredCount === 4
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-primary hover:bg-tertiary-container text-canvas-white'
            }`}
          >
            {isBookmarked ? (
              <>
                <Check className="w-4 h-4" />
                <span>Update Experience &amp; Collection</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to My Collection</span>
              </>
            )}
          </button>

          {isBookmarked && (
            <button
              type="button"
              onClick={async () => {
                await onRemoveFromCollection(selectedCafe.id)
                setJustSaved(false)
              }}
              className="w-full py-2 font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-error border border-border-subtle hover:border-error transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Collection</span>
            </button>
          )}
        </div>
      </form>
    </aside>
  )
}
