'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Award,
  Coffee,
  Flame,
  Compass,
  Laptop,
  Moon,
  Sparkles,
  Heart,
  BookOpen,
  MapPin,
  Zap,
  Users,
  Sun,
  Shield,
  Feather,
  Crown,
  Check,
  Lock,
  X,
  ArrowRight,
} from 'lucide-react'
import PageShell from '@/components/PageShell'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useCafes } from '@/hooks/useCafes'
import {
  computeUserBadges,
  ComputedBadge,
  BadgeCategory,
} from '@/lib/badges'

function BadgeIcon({
  name,
  className = 'w-6 h-6',
}: {
  name: ComputedBadge['iconName']
  className?: string
}) {
  switch (name) {
    case 'coffee':
      return <Coffee className={className} />
    case 'flame':
      return <Flame className={className} />
    case 'compass':
      return <Compass className={className} />
    case 'laptop':
      return <Laptop className={className} />
    case 'moon':
      return <Moon className={className} />
    case 'sparkles':
      return <Sparkles className={className} />
    case 'heart':
      return <Heart className={className} />
    case 'book':
      return <BookOpen className={className} />
    case 'map-pin':
      return <MapPin className={className} />
    case 'zap':
      return <Zap className={className} />
    case 'users':
      return <Users className={className} />
    case 'sun':
      return <Sun className={className} />
    case 'shield':
      return <Shield className={className} />
    case 'feather':
      return <Feather className={className} />
    case 'crown':
      return <Crown className={className} />
    case 'award':
    default:
      return <Award className={className} />
  }
}

const CATEGORIES: ('ALL' | 'UNLOCKED' | 'IN_PROGRESS' | BadgeCategory)[] = [
  'ALL',
  'UNLOCKED',
  'IN_PROGRESS',
  'Exploration',
  'Coffee Craft',
  'Remote Work',
  'Vibe & Culture',
  'Archivist',
]

export default function BadgesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cafesList, isLoading } = useCafes()
  const {
    bookmarkedIds,
    curations,
    bookmarksLoaded,
    loadBookmarks,
  } = useBookmarks(user?.id || null)

  const [selectedFilter, setSelectedFilter] =
    useState<(typeof CATEGORIES)[number]>('ALL')
  const [activeBadge, setActiveBadge] = useState<ComputedBadge | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadBookmarks(user.id)
    }
  }, [user, loadBookmarks])

  const badges = useMemo(
    () => computeUserBadges(cafesList, bookmarkedIds, curations),
    [cafesList, bookmarkedIds, curations]
  )

  const unlockedCount = badges.filter((b) => b.unlocked).length
  const totalPoints = badges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.rewardPoints, 0)
  const overallPercentage =
    badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0

  const filteredBadges = badges.filter((badge) => {
    if (selectedFilter === 'ALL') return true
    if (selectedFilter === 'UNLOCKED') return badge.unlocked
    if (selectedFilter === 'IN_PROGRESS') return !badge.unlocked
    return badge.category === selectedFilter
  })

  if (authLoading || !user) {
    return (
      <PageShell>
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            Loading badges...
          </span>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <main className="flex-grow flex flex-col">
        {/* Hero Header */}
        <section className="py-12 md:py-16 px-6 md:px-12 bg-surface border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-canvas-white border border-border-subtle font-mono text-[10px] uppercase tracking-widest text-secondary mb-3">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span>Curator Milestones &amp; Achievements</span>
              </div>
              <h1 className="font-hanken text-[40px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter leading-none">
                BADGES
              </h1>
              <p className="font-sans text-body-lg text-secondary max-w-xl mt-3">
                Earn badges as you explore coffee shops, share workspace vibes, and build your personal coffee directory. Tap any badge to inspect its full details and requirements.
              </p>
            </div>

            {/* Overall Mastery Card */}
            <div className="w-full md:w-80 bg-canvas-white border border-border-subtle p-5 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                  Overall Progress
                </span>
                <span className="font-mono text-label-caps text-emerald-700 font-bold">
                  {unlockedCount} / {badges.length} Unlocked
                </span>
              </div>
              <div className="w-full h-2 bg-surface-alt border border-border-subtle overflow-hidden mb-3">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase text-secondary">
                <span>Completion: {overallPercentage}%</span>
                <span className="text-amber-700 font-bold">{totalPoints} XP Earned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <div className="bg-canvas-white border-b border-border-subtle px-6 md:px-12 py-3.5 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const active = selectedFilter === cat
              const label =
                cat === 'ALL'
                  ? `All (${badges.length})`
                  : cat === 'UNLOCKED'
                  ? `Unlocked (${unlockedCount})`
                  : cat === 'IN_PROGRESS'
                  ? `In Progress (${badges.length - unlockedCount})`
                  : cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                    active
                      ? 'bg-primary text-canvas-white border-primary'
                      : 'bg-surface-alt text-secondary border-border-subtle hover:text-primary hover:border-primary'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Badges Grid */}
        <section className="px-6 md:px-12 py-12 bg-surface-alt flex-grow">
          <div className="max-w-7xl mx-auto">
            {isLoading || !bookmarksLoaded ? (
              <div className="flex flex-col items-center justify-center py-24 border border-border-subtle bg-canvas-white gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
                  Calculating badge progress...
                </span>
              </div>
            ) : filteredBadges.length === 0 ? (
              <div className="text-center py-20 border border-border-subtle bg-canvas-white">
                <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="font-mono text-label-caps text-secondary">
                  No badges in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setActiveBadge(badge)}
                    className={`text-left p-5 border border-l-4 transition-all duration-200 flex flex-col justify-between group hover:shadow-md ${
                      badge.unlocked
                        ? 'bg-emerald-50/25 border-border-subtle border-l-emerald-600'
                        : badge.current > 0
                        ? 'bg-canvas-white border-border-subtle border-l-amber-500 hover:border-primary'
                        : 'bg-canvas-white/90 border-border-subtle border-l-border-subtle hover:border-primary'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Status & Tier */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`w-12 h-12 flex items-center justify-center border transition-colors ${
                            badge.unlocked
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : badge.current > 0
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-surface-alt text-secondary border-border-subtle group-hover:text-primary'
                          }`}
                        >
                          <BadgeIcon name={badge.iconName} className="w-5 h-5" />
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border ${
                              badge.unlocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                                : badge.current > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                                : 'bg-surface-alt text-secondary border-border-subtle'
                            }`}
                          >
                            {badge.unlocked ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                <span>Unlocked</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>In Progress</span>
                              </>
                            )}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-secondary">
                            {badge.tier} · <span className="text-amber-700 font-semibold">+{badge.rewardPoints} XP</span>
                          </span>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-secondary mb-1">
                        {badge.category}
                      </span>
                      <h2 className="font-hanken text-title-md font-bold text-primary group-hover:underline decoration-1 underline-offset-4">
                        {badge.title}
                      </h2>
                      <p className="font-sans text-body-sm text-secondary mt-1 line-clamp-2">
                        {badge.subtitle}
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-5 pt-3 border-t border-border-subtle">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase mb-1.5">
                        <span className="text-secondary">Progress</span>
                        <span
                          className={`font-bold ${
                            badge.unlocked
                              ? 'text-emerald-700'
                              : badge.current > 0
                              ? 'text-amber-700'
                              : 'text-primary'
                          }`}
                        >
                          {badge.current} / {badge.target} ({badge.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-alt border border-border-subtle overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            badge.unlocked ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${badge.percentage}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Badge Detail Popup Dialog */}
      {activeBadge && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setActiveBadge(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-dialog-title"
            className="bg-canvas-white border border-primary w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="p-6 border-b border-border-subtle flex items-start justify-between gap-4 bg-surface">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center border shrink-0 ${
                    activeBadge.unlocked
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : activeBadge.current > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-canvas-white text-primary border-border-subtle'
                  }`}
                >
                  <BadgeIcon name={activeBadge.iconName} className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span
                      className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border ${
                        activeBadge.unlocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : activeBadge.current > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                          : 'bg-surface-alt text-secondary border-border-subtle'
                      }`}
                    >
                      {activeBadge.unlocked ? 'Unlocked' : 'In Progress'}
                    </span>
                    <span className="px-2 py-0.5 bg-canvas-white border border-border-subtle font-mono text-[9px] uppercase tracking-widest text-primary">
                      {activeBadge.tier} Tier
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 font-mono text-[9px] uppercase tracking-widest text-amber-800 font-semibold">
                      +{activeBadge.rewardPoints} XP
                    </span>
                  </div>
                  <h2
                    id="badge-dialog-title"
                    className="font-hanken text-headline-lg-mobile font-bold text-primary tracking-tight"
                  >
                    {activeBadge.title}
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                    Category: {activeBadge.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveBadge(null)}
                className="w-8 h-8 bg-canvas-white border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors shrink-0"
                aria-label="Close badge details"
              >
                <X className="w-4 h-4 text-primary" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Description & Lore */}
              <div>
                <p className="font-sans text-body-lg text-primary leading-relaxed">
                  {activeBadge.description}
                </p>
                <p className="font-sans text-body-sm text-secondary italic mt-2 border-l-2 border-emerald-600 pl-3">
                  &ldquo;{activeBadge.lore}&rdquo;
                </p>
              </div>

              {/* Progress Indicator Block */}
              <div className="p-4 bg-surface-alt border border-border-subtle">
                <div className="flex items-center justify-between font-mono text-label-caps uppercase mb-2">
                  <span className="text-secondary">Milestone Progress</span>
                  <span
                    className={`font-bold ${
                      activeBadge.unlocked ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {activeBadge.current} of {activeBadge.target} completed (
                    {activeBadge.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-canvas-white border border-border-subtle overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      activeBadge.unlocked ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${activeBadge.percentage}%` }}
                  />
                </div>
              </div>

              {/* How to Earn */}
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-1.5">
                  How to Earn This Badge
                </h3>
                <p className="font-sans text-body-sm text-primary bg-canvas-white border border-border-subtle p-3.5">
                  {activeBadge.howToEarn}
                </p>
              </div>

              {/* Matching Cafes from User's Collection */}
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-2">
                  Cafes Counted Toward This Badge ({activeBadge.matchingCafeNames.length})
                </h3>
                {activeBadge.matchingCafeNames.length === 0 ? (
                  <p className="font-sans text-body-sm text-secondary italic">
                    No cafes in your collection match this badge yet. Head to the map and curate a spot!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeBadge.matchingCafeNames.map((cafeName) => (
                      <span
                        key={cafeName}
                        className="px-2.5 py-1 bg-surface-alt border border-border-subtle font-mono text-[10px] uppercase text-primary flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-primary" />
                        <span>{cafeName}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="p-4 bg-surface border-t border-border-subtle flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveBadge(null)}
                className="px-4 py-2.5 border border-border-subtle bg-canvas-white font-mono text-label-caps uppercase text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                Close
              </button>
              <Link
                href="/"
                onClick={() => setActiveBadge(null)}
                className="px-5 py-2.5 bg-primary text-canvas-white font-mono text-label-caps uppercase tracking-wider hover:bg-tertiary-container transition-colors flex items-center gap-2"
              >
                <span>Curate Cafes on Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

