'use client'

import { CafeCuration } from '@/hooks/useBookmarks'

export type GimmickCategory =
  | 'Tournament & Games'
  | 'Day-to-Night Concept'
  | 'Mobile Cart & Events'
  | 'Hybrid Concept'
  | 'Workshop & Cupping'
  | 'Community Pop-Up'

export interface ShopGimmick {
  id: string
  cafeId: string
  title: string
  category: GimmickCategory
  schedule: string
  description: string
  perkOrHighlight?: string
  createdAt: string
}

export interface ShopIdentity {
  cafeId: string
  signatureConcept: string
  missionVision: string
  openToMobileCarts: boolean
  openToCommunityEvents: boolean
}

export interface DemandStat {
  label: string
  count: number
  percentage: number
}

const GIMMICKS_STORAGE_KEY = 'root_shop_gimmicks_v1'
const IDENTITIES_STORAGE_KEY = 'root_shop_identities_v1'
const COMMUNITY_CURATIONS_KEY = 'root_community_curations_v1'

export const DEFAULT_SHOP_GIMMICKS: ShopGimmick[] = [
  {
    id: 'gimmick-hproper-chess',
    cafeId: 'h-proper-coffee-roasters',
    title: 'Weekend Rapid Chess Tournament & Single-Origin Flights',
    category: 'Tournament & Games',
    schedule: 'Saturdays · 2:00 PM – 7:00 PM',
    description:
      'Bring your best opening! Open 10+0 rapid chess brackets in our roastery courtyard while our baristas pour Bukidnon single-origin flights.',
    perkOrHighlight: 'Free iced latte for all players · 2 bags of roasted beans for the champion',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'gimmick-bowerbird-cart',
    cafeId: 'bowerbird-coffee-cdo',
    title: 'Bowerbird Mobile Espresso Cart — Bookable for Weddings & Events',
    category: 'Mobile Cart & Events',
    schedule: 'Available for Private & Community Bookings',
    description:
      'You asked, we listened! Our friendly barista crew now brings our full specialty espresso bar and signature drinks straight to your weddings, office pop-ups, and parties.',
    perkOrHighlight: 'Includes custom event menu + 2 dedicated specialty baristas',
    createdAt: '2026-11-03T12:00:00Z',
  },
  {
    id: 'gimmick-maison-daynight',
    cafeId: 'maison-alessa-cdo',
    title: 'Coffee by Day, Vinyl & Craft Espresso Martini Bar by Night',
    category: 'Day-to-Night Concept',
    schedule: 'Fridays & Saturdays · 6:00 PM – 11:00 PM',
    description:
      'After sunset, the lights dim and our espresso bar transforms into an intimate acoustic & vinyl lounge serving cold-brew Negronis, zero-proof botanicals, and artisanal tapas.',
    perkOrHighlight: '20% off your first evening signature drink when you work here during the day',
    createdAt: '2026-11-05T15:00:00Z',
  },
  {
    id: 'gimmick-beanpark-carwash',
    cafeId: 'bean-park-cdo',
    title: 'Express Detailing Carwash + Midnight Coders & Creators Jam',
    category: 'Hybrid Concept',
    schedule: 'Daily Carwash 8AM–8PM · Midnight Jam 10PM–2AM',
    description:
      'Drop your car for an exterior foam wash while you plug in with 100 Mbps fiber inside—or join our late-night remote worker & indie builder sessions every Thursday midnight.',
    perkOrHighlight: 'Free Americano or Cold Brew with every full carwash service',
    createdAt: '2026-11-06T09:00:00Z',
  },
  {
    id: 'gimmick-fukuro-cupping',
    cafeId: 'fukuro-coffee-cdo',
    title: 'Slow-Bar Origami Pour-Over & Ceremonial Matcha Whisking Session',
    category: 'Workshop & Cupping',
    schedule: 'Sundays · 3:00 PM – 5:00 PM',
    description:
      'A guided sensory afternoon for people who love quiet craft. Learn hand-pour extraction ratios and whisking techniques right at the counter.',
    perkOrHighlight: 'Limited to 8 seats per session · Take home 100g of filter beans',
    createdAt: '2026-11-07T11:00:00Z',
  },
]

export const DEFAULT_SHOP_IDENTITIES: Record<string, ShopIdentity> = {
  'h-proper-coffee-roasters': {
    cafeId: 'h-proper-coffee-roasters',
    signatureConcept: 'In-House Roastery & Community Tournament Hub',
    missionVision:
      'Championing Philippine farm-to-cup specialty coffee while creating an energetic third place for games, cuppings, and conversation.',
    openToMobileCarts: true,
    openToCommunityEvents: true,
  },
  'bowerbird-coffee-cdo': {
    cafeId: 'bowerbird-coffee-cdo',
    signatureConcept: 'Micro-Roastery + Bookable Mobile Event Cart',
    missionVision:
      'Bringing warm barista hospitality both inside our intimate cafe and out to your favorite celebrations via our mobile espresso cart.',
    openToMobileCarts: true,
    openToCommunityEvents: true,
  },
  'maison-alessa-cdo': {
    cafeId: 'maison-alessa-cdo',
    signatureConcept: 'Coffee & Brunch by Day · Craft Bar & Vinyl by Night',
    missionVision:
      'A seamless day-to-night sanctuary—sunlit creative workspace in the morning, soulful social lounge after dusk.',
    openToMobileCarts: true,
    openToCommunityEvents: true,
  },
  'bean-park-cdo': {
    cafeId: 'bean-park-cdo',
    signatureConcept: '24/7 Deep-Work Sanctuary + Carwash & Coffee Hub',
    missionVision:
      'Built for night owls, remote builders, and busy drivers who want great specialty coffee alongside everyday convenience.',
    openToMobileCarts: false,
    openToCommunityEvents: true,
  },
}

const SEEDED_DEMAND_CURATIONS: Record<string, Partial<CafeCuration>[]> = {
  'h-proper-coffee-roasters': [
    {
      coffeeQuality: 'Exceptional Brew',
      workFriendly: 'Great for Deep Work',
      vibes: ['In-House Micro-Roastery', 'Warm Barista Company'],
      recommendations: [
        'Host Chess / Board Game Tournaments',
        'Brewing & Latte Art Throwdowns',
        'Mobile Cart for Events & Weddings',
      ],
      mustOrder: 'Ethiopian Pour Over & Sea Salt Latte',
      experienceNote:
        'Love the courtyard energy—people here would totally show up for weekend chess tournaments and public cuppings!',
    },
    {
      coffeeQuality: 'Specialty Great',
      workFriendly: 'Casual Laptop Spot',
      vibes: ['Coffee by Day, Bar by Night', 'Warm Barista Company'],
      recommendations: [
        'Host Chess / Board Game Tournaments',
        'Coffee by Day, Cocktail Bar by Night',
      ],
      experienceNote:
        'Baristas are super welcoming. An evening espresso tonic / cocktail menu would fit right in.',
    },
  ],
  'bowerbird-coffee-cdo': [
    {
      coffeeQuality: 'Exceptional Brew',
      workFriendly: 'Great for Deep Work',
      vibes: ['Warm Barista Company', 'In-House Micro-Roastery', 'Quiet & Focused'],
      recommendations: [
        'Mobile Cart for Events & Weddings',
        'Brewing & Latte Art Throwdowns',
      ],
      mustOrder: 'Bukidnon Single-Origin Filter',
      experienceNote:
        'People love their company so much—they should definitely do mobile coffee carts for weddings and corporate events!',
    },
    {
      coffeeQuality: 'Specialty Great',
      workFriendly: 'Great for Deep Work',
      vibes: ['Warm Barista Company', 'Cozy & Warm'],
      recommendations: [
        'Mobile Cart for Events & Weddings',
        'Pop-Up Market & Brand Collabs',
      ],
      experienceNote:
        'The baristas make you feel like family. Everyone at our office wants to book them as a mobile cart.',
    },
  ],
  'maison-alessa-cdo': [
    {
      coffeeQuality: 'Specialty Great',
      workFriendly: 'Best for Unplugging',
      vibes: ['Coffee by Day, Bar by Night', 'Art, Vinyl & Community'],
      recommendations: [
        'Coffee by Day, Cocktail Bar by Night',
        'Acoustic / Vinyl Listening Nights',
        'Mobile Cart for Events & Weddings',
      ],
      mustOrder: 'Kouign-Amann & Iced Spanish Latte',
      experienceNote:
        'The aesthetic transitions so well from afternoon coffee to an evening cocktail & vinyl bar!',
    },
  ],
  'bean-park-cdo': [
    {
      coffeeQuality: 'Specialty Great',
      workFriendly: 'Great for Deep Work',
      vibes: ['Carwash + Coffee Hub', '24/7 Late Night', 'Quiet & Focused'],
      recommendations: [
        'Host Chess / Board Game Tournaments',
        'More Outlets & Work Tables',
        'Run Club / Cycling Pitstop',
      ],
      mustOrder: '24/7 Cold Brew Flight',
      experienceNote:
        'Getting my car washed while finishing a sprint on fast WiFi is unbeatable. Late-night chess or coding jams work great here.',
    },
  ],
}

export function getShopGimmicks(cafeId?: string): ShopGimmick[] {
  let list = DEFAULT_SHOP_GIMMICKS
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(GIMMICKS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed
        }
      } else {
        localStorage.setItem(GIMMICKS_STORAGE_KEY, JSON.stringify(DEFAULT_SHOP_GIMMICKS))
      }
    } catch {
      // Fallback to defaults
    }
  }
  if (cafeId) {
    return list.filter((g) => g.cafeId === cafeId)
  }
  return list
}

export function addShopGimmick(
  gimmick: Omit<ShopGimmick, 'id' | 'createdAt'>
): ShopGimmick {
  const existing = getShopGimmicks()
  const created: ShopGimmick = {
    ...gimmick,
    id: `gimmick-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const updated = [created, ...existing]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GIMMICKS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }
  return created
}

export function deleteShopGimmick(id: string): ShopGimmick[] {
  const existing = getShopGimmicks()
  const updated = existing.filter((g) => g.id !== id)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GIMMICKS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }
  return updated
}

export function getShopIdentity(cafeId: string): ShopIdentity {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(IDENTITIES_STORAGE_KEY)
      const map: Record<string, ShopIdentity> = raw
        ? { ...DEFAULT_SHOP_IDENTITIES, ...JSON.parse(raw) }
        : DEFAULT_SHOP_IDENTITIES
      if (map[cafeId]) return map[cafeId]
    } catch {
      // Ignore
    }
  }
  return (
    DEFAULT_SHOP_IDENTITIES[cafeId] || {
      cafeId,
      signatureConcept: 'Specialty Coffee & Community Third Place',
      missionVision:
        'Serving thoughtfully sourced coffee while building spaces shaped by our community’s lived experiences.',
      openToMobileCarts: true,
      openToCommunityEvents: true,
    }
  )
}

export function saveShopIdentity(identity: ShopIdentity): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(IDENTITIES_STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : {}
    const updated = { ...DEFAULT_SHOP_IDENTITIES, ...existing, [identity.cafeId]: identity }
    localStorage.setItem(IDENTITIES_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore
  }
}

export function recordCommunityCurationSignal(curation: CafeCuration): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(COMMUNITY_CURATIONS_KEY)
    const map: Record<string, CafeCuration[]> = raw ? JSON.parse(raw) : {}
    const list = Array.isArray(map[curation.cafeId]) ? map[curation.cafeId] : []
    map[curation.cafeId] = [curation, ...list.slice(0, 29)]
    localStorage.setItem(COMMUNITY_CURATIONS_KEY, JSON.stringify(map))
  } catch {
    // Ignore
  }
}

export function getCafeDemandInsights(cafeId: string): {
  totalResponses: number
  topUniquenessTags: DemandStat[]
  topDemandRequests: DemandStat[]
  livedExperienceNotes: { note: string; order?: string; quality?: string }[]
} {
  let userSubmitted: Partial<CafeCuration>[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COMMUNITY_CURATIONS_KEY)
      if (raw) {
        const map = JSON.parse(raw)
        if (Array.isArray(map[cafeId])) {
          userSubmitted = map[cafeId]
        }
      }
    } catch {
      // Ignore
    }
  }

  const seeded = SEEDED_DEMAND_CURATIONS[cafeId] || [
    {
      coffeeQuality: 'Specialty Great',
      workFriendly: 'Great for Deep Work',
      vibes: ['Warm Barista Company', 'Coffee by Day, Bar by Night'],
      recommendations: [
        'Mobile Cart for Events & Weddings',
        'Host Chess / Board Game Tournaments',
      ],
      experienceNote:
        'Great company and atmosphere—would love to see them host community nights or offer mobile event carts!',
    },
  ]

  const allEntries = [...userSubmitted, ...seeded]
  const total = Math.max(1, allEntries.length)

  const vibeCounts: Record<string, number> = {}
  const demandCounts: Record<string, number> = {}
  const notes: { note: string; order?: string; quality?: string }[] = []

  allEntries.forEach((entry) => {
    ;(entry.vibes || []).forEach((v) => {
      vibeCounts[v] = (vibeCounts[v] || 0) + 1
    })
    ;(entry.recommendations || []).forEach((r) => {
      demandCounts[r] = (demandCounts[r] || 0) + 1
    })
    if (entry.experienceNote && entry.experienceNote.trim()) {
      notes.push({
        note: entry.experienceNote.trim(),
        order: entry.mustOrder,
        quality: entry.coffeeQuality,
      })
    }
  })

  const toSortedStats = (counts: Record<string, number>): DemandStat[] =>
    Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.min(100, Math.round((count / total) * 100)),
      }))
      .sort((a, b) => b.count - a.count)

  return {
    totalResponses: allEntries.length,
    topUniquenessTags: toSortedStats(vibeCounts),
    topDemandRequests: toSortedStats(demandCounts),
    livedExperienceNotes: notes.slice(0, 6),
  }
}

