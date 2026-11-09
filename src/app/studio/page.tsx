'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Megaphone,
  Sparkles,
  Calendar,
  Plus,
  Trash2,
  Check,
  HelpCircle,
  TrendingUp,
  MessageSquareQuote,
  Store,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import PageShell from '@/components/PageShell'
import Tooltip from '@/components/Tooltip'
import { useAuth } from '@/hooks/useAuth'
import { useCafes } from '@/hooks/useCafes'
import {
  getShopGimmicks,
  addShopGimmick,
  deleteShopGimmick,
  getShopIdentity,
  saveShopIdentity,
  getCafeDemandInsights,
  GimmickCategory,
  ShopGimmick,
} from '@/lib/ownerStudio'

const GIMMICK_CATEGORIES: GimmickCategory[] = [
  'Tournament & Games',
  'Day-to-Night Concept',
  'Mobile Cart & Events',
  'Hybrid Concept',
  'Workshop & Cupping',
  'Community Pop-Up',
]

const QUICK_GIMMICK_PRESETS: {
  label: string
  category: GimmickCategory
  title: string
  schedule: string
  description: string
  perk: string
}[] = [
  {
    label: '♟️ Chess Tournament',
    category: 'Tournament & Games',
    title: 'Saturday Rapid Chess Tournament & Cold Brew Flights',
    schedule: 'This Saturday · 2:00 PM – 7:00 PM',
    description:
      'Open rapid chess brackets in the cafe! Bring a friend or play solo rounds while enjoying our specialty espresso and filter pours.',
    perk: 'Free iced latte for all players · 2 bags of roasted beans for 1st place',
  },
  {
    label: '🛒 Mobile Event Cart',
    category: 'Mobile Cart & Events',
    title: 'Mobile Specialty Espresso Cart — Now Bookable for Events',
    schedule: 'Open for Weddings, Pop-Ups & Office Bookings',
    description:
      'By popular community demand, our barista team now brings a full specialty coffee bar straight to your private events and celebrations.',
    perk: 'Custom signature drink menu + 2 baristas included',
  },
  {
    label: '🍸 Coffee by Day, Bar by Night',
    category: 'Day-to-Night Concept',
    title: 'Coffee & Deep Work by Day · Craft Bar & Vinyl by Night',
    schedule: 'Fridays & Saturdays · 6:00 PM – 12:00 AM',
    description:
      'After 6 PM, our espresso bar transitions into a cozy acoustic & vinyl lounge serving espresso martinis, cold-brew Negronis, and zero-proof botanicals.',
    perk: 'Free bar bites with your first evening craft drink',
  },
  {
    label: '🚗 Carwash + Coffee Hub',
    category: 'Hybrid Concept',
    title: 'Detail Carwash + Specialty Coffee Combo',
    schedule: 'Daily · 8:00 AM – 6:00 PM',
    description:
      'Leave your car for a full foam wash and interior detail while you work on fast WiFi and sip a freshly pulled single-origin latte.',
    perk: 'Complimentary Americano or Iced Tea with every full wash',
  },
  {
    label: '🎵 Vinyl & Acoustic Night',
    category: 'Community Pop-Up',
    title: 'Analog Vinyl Listening & Acoustic Sessions',
    schedule: 'Sunday Evenings · 5:00 PM – 9:00 PM',
    description:
      'Bring your favorite vinyl records or unwind to live local acoustic sets over slow-bar pour-overs and pastries.',
    perk: '15% off slow-bar filter pours all evening',
  },
]

const SIGNATURE_CONCEPT_CHIPS = [
  'Coffee by Day, Craft Bar by Night',
  'Micro-Roastery + Bookable Mobile Cart',
  'Carwash + Specialty Coffee Hub',
  '24/7 Deep-Work & Tournament Sanctuary',
  'Slow-Bar Pour-Over & Vinyl Lounge',
]

export default function ShopStudioPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cafesList, isLoading } = useCafes()

  const cdoCafes = useMemo(() => {
    const filtered = cafesList.filter((c) => {
      const loc = c.location.toLowerCase()
      return (
        loc.includes('cagayan de oro') ||
        loc.includes('cdo') ||
        c.id.endsWith('-cdo') ||
        c.id === 'h-proper-coffee-roasters'
      )
    })
    return filtered.length > 0 ? filtered : cafesList
  }, [cafesList])

  const [selectedCafeId, setSelectedCafeId] = useState<string>(
    'h-proper-coffee-roasters'
  )

  // Identity state
  const [signatureConcept, setSignatureConcept] = useState('')
  const [missionVision, setMissionVision] = useState('')
  const [openToMobileCarts, setOpenToMobileCarts] = useState(true)
  const [openToCommunityEvents, setOpenToCommunityEvents] = useState(true)
  const [identitySaved, setIdentitySaved] = useState(false)

  // Gimmicks state
  const [gimmicks, setGimmicks] = useState<ShopGimmick[]>([])
  const [category, setCategory] = useState<GimmickCategory>('Tournament & Games')
  const [title, setTitle] = useState('')
  const [schedule, setSchedule] = useState('')
  const [description, setDescription] = useState('')
  const [perk, setPerk] = useState('')
  const [formError, setFormError] = useState('')
  const [gimmickPublished, setGimmickPublished] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  // Default to user's managed_cafe_id if present
  useEffect(() => {
    if (user?.user_metadata?.managed_cafe_id) {
      setSelectedCafeId(user.user_metadata.managed_cafe_id)
    }
  }, [user])

  // Load identity & gimmicks whenever selectedCafeId changes
  useEffect(() => {
    if (!selectedCafeId) return
    const idData = getShopIdentity(selectedCafeId)
    setSignatureConcept(idData.signatureConcept)
    setMissionVision(idData.missionVision)
    setOpenToMobileCarts(idData.openToMobileCarts)
    setOpenToCommunityEvents(idData.openToCommunityEvents)
    setIdentitySaved(false)

    setGimmicks(getShopGimmicks(selectedCafeId))
  }, [selectedCafeId])

  const demandInsights = useMemo(
    () => getCafeDemandInsights(selectedCafeId),
    [selectedCafeId, gimmicks.length]
  )

  const selectedCafe = cdoCafes.find((c) => c.id === selectedCafeId) || cdoCafes[0]

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signatureConcept.trim()) return
    saveShopIdentity({
      cafeId: selectedCafeId,
      signatureConcept: signatureConcept.trim(),
      missionVision: missionVision.trim(),
      openToMobileCarts,
      openToCommunityEvents,
    })
    setIdentitySaved(true)
    setTimeout(() => setIdentitySaved(false), 3000)
  }

  const handleApplyPreset = (preset: (typeof QUICK_GIMMICK_PRESETS)[number]) => {
    setCategory(preset.category)
    setTitle(preset.title)
    setSchedule(preset.schedule)
    setDescription(preset.description)
    setPerk(preset.perk)
    setFormError('')
    setGimmickPublished(false)
  }

  const handleTurnDemandIntoGimmick = (demandLabel: string) => {
    setFormError('')
    setGimmickPublished(false)
    if (demandLabel.toLowerCase().includes('mobile cart')) {
      handleApplyPreset(QUICK_GIMMICK_PRESETS[1])
    } else if (demandLabel.toLowerCase().includes('chess')) {
      handleApplyPreset(QUICK_GIMMICK_PRESETS[0])
    } else if (demandLabel.toLowerCase().includes('cocktail') || demandLabel.toLowerCase().includes('night')) {
      handleApplyPreset(QUICK_GIMMICK_PRESETS[2])
    } else if (demandLabel.toLowerCase().includes('vinyl') || demandLabel.toLowerCase().includes('acoustic')) {
      handleApplyPreset(QUICK_GIMMICK_PRESETS[4])
    } else {
      setCategory('Community Pop-Up')
      setTitle(`${demandLabel} at ${selectedCafe?.name || 'Our Cafe'}`)
      setSchedule('This Weekend · 3:00 PM – 8:00 PM')
      setDescription(
        `You requested "${demandLabel}" in your lived-experience notes—so we're making it happen! Join us this weekend.`
      )
      setPerk('Special community perk for early attendees')
    }
  }

  const handlePublishGimmick = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setGimmickPublished(false)

    if (title.trim().length < 5) {
      setFormError('Please enter an event or gimmick headline (at least 5 characters).')
      return
    }
    if (schedule.trim().length < 3) {
      setFormError('Please specify when this happens (e.g. "Saturdays 2PM–6PM" or "Bookable Daily").')
      return
    }
    if (description.trim().length < 10) {
      setFormError('Please add a brief description (at least 10 characters) so guests know what to expect.')
      return
    }

    addShopGimmick({
      cafeId: selectedCafeId,
      title: title.trim(),
      category,
      schedule: schedule.trim(),
      description: description.trim(),
      perkOrHighlight: perk.trim() || undefined,
    })

    setGimmicks(getShopGimmicks(selectedCafeId))
    setTitle('')
    setSchedule('')
    setDescription('')
    setPerk('')
    setGimmickPublished(true)
  }

  const handleDeleteGimmick = (id: string) => {
    deleteShopGimmick(id)
    setGimmicks(getShopGimmicks(selectedCafeId))
  }

  if (authLoading || !user) {
    return (
      <PageShell>
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            Loading Shop Studio...
          </span>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <main className="flex-grow flex flex-col">
        {/* Studio Header */}
        <section className="py-10 md:py-14 px-6 md:px-12 bg-surface border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-300 font-mono text-[10px] uppercase tracking-widest text-amber-900 font-bold mb-3">
                <Megaphone className="w-3.5 h-3.5 text-amber-700" />
                <span>For Coffee Shop Owners &amp; Community Managers</span>
              </div>
              <h1 className="font-hanken text-[36px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter leading-none">
                SHOP STUDIO &amp; GIMMICKS
              </h1>
              <p className="font-sans text-body-lg text-secondary max-w-2xl mt-3">
                See real lived-experience demand from your visitors—and announce your shop&apos;s unique concepts, chess tournaments, mobile event carts, or day-to-night happenings directly onto the Map.
              </p>
            </div>

            {/* Active Coffee Shop Selector */}
            <div className="w-full lg:w-80 bg-canvas-white border border-border-subtle p-4 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="studio-cafe-select"
                  className="font-mono text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5 text-primary" />
                  <span>Managing Coffee Shop</span>
                </label>
                <Tooltip
                  position="left"
                  content="Switch between coffee shops to inspect their community demand or post new events and gimmicks."
                >
                  <HelpCircle className="w-3.5 h-3.5 text-secondary cursor-help" />
                </Tooltip>
              </div>
              <select
                id="studio-cafe-select"
                value={selectedCafeId}
                onChange={(e) => setSelectedCafeId(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-alt border border-border-subtle px-3 py-2.5 font-mono text-label-caps text-primary outline-none focus:border-primary cursor-pointer"
              >
                {cdoCafes.map((cafe) => (
                  <option key={cafe.id} value={cafe.id}>
                    {cafe.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Studio Main Grid */}
        <section className="px-6 md:px-12 py-10 bg-surface-alt flex-grow">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (5 cols): Community Demand Signals & Shop Identity */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Community Demand Signals Card */}
              <div className="bg-canvas-white border border-border-subtle border-l-4 border-l-emerald-600 p-6 space-y-5">
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-800 font-bold">
                        Live Community Demand
                      </span>
                    </div>
                    <h2 className="font-hanken text-title-md font-bold text-primary mt-1">
                      What Guests Want Next at {selectedCafe?.name}
                    </h2>
                    <p className="font-sans text-[12px] text-secondary mt-0.5">
                      Aggregated from customer lived-experience curations on the Map.
                    </p>
                  </div>
                  <Tooltip
                    position="left"
                    content="When users curate your cafe on the Map, their answers to 'Uniqueness' and 'What Should They Do Next?' appear here in real time."
                  >
                    <HelpCircle className="w-4 h-4 text-secondary cursor-help shrink-0" />
                  </Tooltip>
                </div>

                {/* Top Requested Next Moves */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-bold">
                      Top Requested Gimmicks &amp; Offerings
                    </span>
                    <span className="font-mono text-[9px] text-emerald-700 uppercase font-semibold">
                      Click &ldquo;Launch&rdquo; to pre-fill
                    </span>
                  </div>

                  <div className="space-y-3">
                    {demandInsights.topDemandRequests.slice(0, 4).map((req) => (
                      <div
                        key={req.label}
                        className="p-3 bg-surface-alt border border-border-subtle space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-primary">
                            {req.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTurnDemandIntoGimmick(req.label)}
                            className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[9px] uppercase tracking-wider transition-colors shrink-0"
                          >
                            Launch →
                          </button>
                        </div>
                        <div className="w-full h-1.5 bg-canvas-white border border-border-subtle overflow-hidden">
                          <div
                            className="h-full bg-emerald-600"
                            style={{ width: `${req.percentage}%` }}
                          />
                        </div>
                        <span className="block font-mono text-[9px] text-secondary uppercase">
                          {req.percentage}% of curators requested this ({req.count}{' '}
                          {req.count === 1 ? 'vote' : 'votes'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Perceived Uniqueness Identity Tags */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary font-bold mb-2">
                    How Guests Describe Your Uniqueness
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {demandInsights.topUniquenessTags.map((tag) => (
                      <span
                        key={tag.label}
                        className="px-2.5 py-1 bg-amber-50 border border-amber-200 font-mono text-[9px] uppercase text-amber-900 font-semibold"
                      >
                        {tag.label} ({tag.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Lived Experience Quotes */}
                <div>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-secondary font-bold mb-2">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-primary" />
                    <span>Recent Lived-Experience Notes</span>
                  </span>
                  <div className="space-y-2">
                    {demandInsights.livedExperienceNotes.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-canvas-white border border-border-subtle text-left"
                      >
                        <p className="font-sans text-[12px] text-primary italic leading-relaxed">
                          &ldquo;{item.note}&rdquo;
                        </p>
                        {item.order && (
                          <span className="inline-block mt-1.5 font-mono text-[9px] uppercase text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                            Go-to: {item.order}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Shop Mission, Vision & Signature Concept Card */}
              <form
                onSubmit={handleSaveIdentity}
                className="bg-canvas-white border border-border-subtle p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                      Shop Identity &amp; Vision
                    </span>
                    <h2 className="font-hanken text-title-md font-bold text-primary">
                      Signature Concept &amp; Mission
                    </h2>
                  </div>
                  <Tooltip
                    position="left"
                    content="Your Signature Concept badge appears at the top of your cafe's drawer on the Map so visitors immediately know your hook."
                  >
                    <HelpCircle className="w-4 h-4 text-secondary cursor-help shrink-0" />
                  </Tooltip>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    Signature Concept Hook
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {SIGNATURE_CONCEPT_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSignatureConcept(chip)}
                        className={`px-2 py-1 font-mono text-[9px] uppercase border transition-colors ${
                          signatureConcept === chip
                            ? 'bg-primary text-canvas-white border-primary'
                            : 'bg-surface-alt text-secondary border-border-subtle hover:text-primary'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    maxLength={80}
                    value={signatureConcept}
                    onChange={(e) => setSignatureConcept(e.target.value)}
                    placeholder="e.g. Coffee by Day, Craft Cocktail Bar by Night"
                    className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    Mission &amp; Community Vision
                  </label>
                  <textarea
                    rows={2}
                    maxLength={240}
                    value={missionVision}
                    onChange={(e) => setMissionVision(e.target.value)}
                    placeholder="Share your coffee shop's mission and what kind of community you're building..."
                    className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openToMobileCarts}
                      onChange={(e) => setOpenToMobileCarts(e.target.checked)}
                      className="w-4 h-4 accent-emerald-700"
                    />
                    <span>Available for Mobile Event Carts</span>
                  </label>
                  <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openToCommunityEvents}
                      onChange={(e) => setOpenToCommunityEvents(e.target.checked)}
                      className="w-4 h-4 accent-emerald-700"
                    />
                    <span>Open to Tournaments &amp; Pop-Ups</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {identitySaved ? (
                    <span className="font-mono text-[10px] uppercase text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Concept updated on Map!
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-canvas-white font-mono text-[10px] uppercase tracking-wider hover:bg-tertiary-container transition-colors"
                  >
                    Save Shop Identity
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN (7 cols): Announce Gimmicks, Tournaments & Happenings */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Create New Gimmick / Event Form */}
              <form
                onSubmit={handlePublishGimmick}
                noValidate
                className="bg-canvas-white border border-border-subtle border-l-4 border-l-amber-500 p-6 space-y-5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-amber-800 font-bold">
                        Announce a Gimmick or Happening
                      </span>
                    </div>
                    <h2 className="font-hanken text-title-md font-bold text-primary mt-1">
                      Host a Tournament, Pop-Up, or New Concept
                    </h2>
                    <p className="font-sans text-[12px] text-secondary mt-0.5">
                      Tap a quick template below or write your own announcement. Published items appear immediately on your cafe&apos;s Map drawer.
                    </p>
                  </div>
                  <Tooltip
                    position="left"
                    content="Need inspiration? Click any preset pill below to auto-fill a ready-to-post announcement."
                  >
                    <HelpCircle className="w-4 h-4 text-secondary cursor-help shrink-0" />
                  </Tooltip>
                </div>

                {/* 1-Tap Quick Templates */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-secondary mb-2">
                    Quick-Fill Gimmick Templates (1-Tap)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_GIMMICK_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-3 py-1.5 bg-amber-50/70 hover:bg-amber-100 border border-amber-300 font-mono text-[10px] uppercase tracking-wider text-amber-900 font-semibold transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-error/10 border border-error/30 flex items-center gap-2 text-error font-mono text-[10px] uppercase">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                      Gimmick / Event Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as GimmickCategory)}
                      className="w-full px-3 py-2.5 border border-border-subtle bg-surface-alt font-mono text-[11px] uppercase text-primary outline-none focus:border-primary"
                    >
                      {GIMMICK_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                      Schedule / When It Happens
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="e.g. This Saturday · 2:00 PM – 7:00 PM"
                      className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    Headline / Announcement Title
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekend Rapid Chess Tournament & Single-Origin Flights"
                    className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    Details &amp; What Guests Can Expect
                  </label>
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the gimmick, tournament rules, mobile cart booking details, or night menu..."
                    className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    Guest Perk or Highlight <span className="text-secondary font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={perk}
                    onChange={(e) => setPerk(e.target.value)}
                    placeholder="e.g. Free iced latte for all tournament players · 2 bags of beans for champion"
                    className="w-full px-3 py-2 border border-border-subtle bg-surface-alt focus:bg-canvas-white focus:border-primary outline-none font-sans text-body-sm text-primary"
                  />
                </div>

                {gimmickPublished && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-900 font-bold">
                        Published! Now live on {selectedCafe?.name}&apos;s Map drawer.
                      </span>
                    </div>
                    <Link
                      href="/"
                      className="px-3 py-1 bg-emerald-700 text-white font-mono text-[9px] uppercase tracking-wider hover:bg-emerald-800 transition-colors"
                    >
                      View on Map →
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-tertiary-container text-canvas-white font-mono text-label-caps uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Gimmick / Announcement</span>
                </button>
              </form>

              {/* 2. Live Published Gimmicks & Happenings for Selected Shop */}
              <div className="bg-canvas-white border border-border-subtle p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                      Live on the Map
                    </span>
                    <h3 className="font-hanken text-title-md font-bold text-primary">
                      Active Happenings at {selectedCafe?.name} ({gimmicks.length})
                    </h3>
                  </div>
                  <Link
                    href="/"
                    className="font-mono text-[10px] uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Open Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {gimmicks.length === 0 ? (
                  <div className="py-10 text-center border border-border-subtle bg-surface-alt">
                    <Megaphone className="w-8 h-8 text-secondary mx-auto mb-2 opacity-60" />
                    <p className="font-mono text-label-caps text-secondary">
                      No active gimmicks or events posted for this shop yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gimmicks.map((g) => (
                      <div
                        key={g.id}
                        className="p-4 bg-surface-alt border border-border-subtle border-l-4 border-l-emerald-600 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[9px] uppercase font-bold">
                              {g.category}
                            </span>
                            <span className="font-mono text-[10px] text-secondary flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {g.schedule}
                            </span>
                          </div>
                          <h4 className="font-hanken text-body-lg font-bold text-primary">
                            {g.title}
                          </h4>
                          <p className="font-sans text-body-sm text-secondary leading-relaxed">
                            {g.description}
                          </p>
                          {g.perkOrHighlight && (
                            <p className="inline-block font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5">
                              ★ {g.perkOrHighlight}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteGimmick(g.id)}
                          title="Remove announcement"
                          aria-label="Remove announcement"
                          className="p-2 border border-border-subtle bg-canvas-white text-secondary hover:text-error hover:border-error transition-colors shrink-0 self-end sm:self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}

