'use client'

import { Cafe } from '@/lib/data'

export type LogSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO'

export interface SystemLogEntry {
  id: string
  timestamp: string
  severity: LogSeverity
  source: string
  message: string
  details: string
  statusCode?: number
  resolved: boolean
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'managers' | 'user'
  managedCafeId: string | null
  status: 'Active' | 'Suspended'
  createdAt: string
  lastActive: string
}

export interface NewsArticle {
  id: string
  title: string
  subtitle: string
  category:
    | 'City Movement'
    | 'Gimmick & Event'
    | 'Promo & Perk'
    | 'Roaster Dispatch'
    | 'New Opening'
  locationArea:
    | 'Downtown & Velez'
    | 'Corrales & Lifestyle District'
    | 'Nazareth & Tomas Saco'
    | 'Uptown CDO'
    | 'Bukidnon Highlands'
  cafeId?: string
  cafeName?: string
  author: string
  publishedAt: string
  readTime: string
  image: string
  body: string[]
  highlightPerk?: string
  featured?: boolean
}

const CUSTOM_CAFES_KEY = 'root_admin_custom_cafes_v1'
const DELETED_CAFE_IDS_KEY = 'root_admin_deleted_cafes_v1'
const MANAGED_USERS_KEY = 'root_admin_users_v1'
const SYSTEM_LOGS_KEY = 'root_admin_system_logs_v1'
const NEWS_ARTICLES_KEY = 'root_news_articles_v1'

export const DEFAULT_SYSTEM_LOGS: SystemLogEntry[] = [
  {
    id: 'log-101',
    timestamp: '2026-11-09T22:41:12Z',
    severity: 'WARNING',
    source: 'Supabase / PostgREST',
    message: "Table 'public.bookmarks' not found (PGRST205) — using localStorage + user_metadata fallback",
    details:
      'GET /rest/v1/bookmarks?select=cafe_id returned 404 PGRST205. Automatic self-healing fallback activated via root_bookmarks_<uid> and auth.updateUser metadata sync.',
    statusCode: 404,
    resolved: true,
  },
  {
    id: 'log-102',
    timestamp: '2026-11-09T23:05:48Z',
    severity: 'ERROR',
    source: 'MapTileService / Carto',
    message: 'CartoDB basemap tile returned API_KEY_REQUIRED watermark',
    details:
      'Replaced CartoDB tile provider with Esri World_Light_Gray_Base (maxNativeZoom: 15) to guarantee clean, label-free map rendering.',
    statusCode: 403,
    resolved: true,
  },
  {
    id: 'log-103',
    timestamp: '2026-11-10T00:12:04Z',
    severity: 'WARNING',
    source: 'Geolocation API',
    message: 'User browser geolocation request timed out after 6000ms',
    details:
      'navigator.geolocation.getCurrentPosition exceeded timeout threshold on mobile Safari. Defaulted map center to Cagayan de Oro [8.4772, 124.6459].',
    statusCode: 408,
    resolved: false,
  },
  {
    id: 'log-104',
    timestamp: '2026-11-10T00:19:30Z',
    severity: 'INFO',
    source: 'Auth / Session Lock',
    message: 'Non-blocking auth lock initialized for Supabase client',
    details:
      'Custom lock handler active in src/lib/supabase.ts to prevent Navigator LockManager deadlocks during HMR and concurrent profile lookups.',
    statusCode: 200,
    resolved: true,
  },
  {
    id: 'log-105',
    timestamp: '2026-11-10T00:29:15Z',
    severity: 'ERROR',
    source: 'ImageCDN / Unsplash',
    message: 'Upstream image timeout on external thumbnail asset',
    details:
      'GET https://images.unsplash.com/photo-1554118811-1e0d58224f24 timed out on slow connection. Fallback placeholder image automatically rendered.',
    statusCode: 504,
    resolved: false,
  },
]

export const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Rafael Adrian (Platform Admin)',
    email: 'admin@kapeta.com',
    role: 'superadmin',
    managedCafeId: null,
    status: 'Active',
    createdAt: '2026-10-01T08:00:00Z',
    lastActive: 'Just now',
  },
  {
    id: 'usr-owner-hproper',
    name: 'H Proper Roastery Team',
    email: 'roastery@hproper.com',
    role: 'admin',
    managedCafeId: 'h-proper-coffee-roasters',
    status: 'Active',
    createdAt: '2026-10-12T09:30:00Z',
    lastActive: '18 mins ago',
  },
  {
    id: 'usr-owner-bowerbird',
    name: 'Bowerbird Barista Lead',
    email: 'hello@bowerbirdcoffee.ph',
    role: 'managers',
    managedCafeId: 'bowerbird-coffee-cdo',
    status: 'Active',
    createdAt: '2026-10-15T14:20:00Z',
    lastActive: '1 hour ago',
  },
  {
    id: 'usr-owner-maison',
    name: 'Maison Alessa Manager',
    email: 'events@maisonalessa.com',
    role: 'admin',
    managedCafeId: 'maison-alessa-cdo',
    status: 'Active',
    createdAt: '2026-10-19T11:10:00Z',
    lastActive: '3 hours ago',
  },
  {
    id: 'usr-curator-1',
    name: 'Mikaela Santos',
    email: 'mikaela.nomad@gmail.com',
    role: 'user',
    managedCafeId: null,
    status: 'Active',
    createdAt: '2026-11-01T16:45:00Z',
    lastActive: 'Yesterday',
  },
]

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-cdo-day-to-night',
    title:
      'Coffee by Day, Craft Bar by Night: How Corrales & Tomas Saco Cafes Are Reinventing the Evening Shift',
    subtitle:
      'From sunny laptop sanctuaries at 9 AM to vinyl listening lounges and espresso martini bars after 6 PM.',
    category: 'City Movement',
    locationArea: 'Corrales & Lifestyle District',
    cafeId: 'maison-alessa-cdo',
    cafeName: 'Maison Alessa',
    author: 'ROOT Editorial Desk',
    publishedAt: '2 hours ago',
    readTime: '3 min read',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop',
    featured: true,
    highlightPerk: '20% off evening craft drinks when you keep your morning coffee receipt',
    body: [
      'Across Corrales Avenue and Tomas Saco Street, a new movement is reshaping how Cagayan de Oro experiences third-wave coffee spaces. Instead of closing their doors at dusk, independent cafes are introducing dual day-to-night identities.',
      'By day, spaces like Maison Alessa and H Proper hum with remote workers, fast fiber WiFi, and single-origin pour-overs. Once the sun dips below 6 PM, lighting dims, analog vinyl records start spinning, and baristas switch from dialing in morning flat whites to shaking cold-brew Negronis and zero-proof botanical tonics.',
      'Community curations on ROOT show that "Coffee by Day, Bar by Night" is now one of the top-requested concepts across the city—giving regulars a seamless transition from deep work to social unwinding without ever changing tables.',
    ],
  },
  {
    id: 'news-mobile-carts-movement',
    title:
      'Why CDO’s Favorite Barista Teams Are Taking Their Espresso Bars on the Road with Mobile Event Carts',
    subtitle:
      'Lived-experience curations reveal that regulars don’t just love the coffee—they want the barista crew at their weddings, offices, and pop-ups.',
    category: 'City Movement',
    locationArea: 'Nazareth & Tomas Saco',
    cafeId: 'bowerbird-coffee-cdo',
    cafeName: 'Bowerbird Coffee Roasters',
    author: 'Camille Vega · City Dispatch',
    publishedAt: '5 hours ago',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=900&auto=format&fit=crop',
    highlightPerk: 'Custom signature wedding & corporate menus now open for booking',
    body: [
      'When we asked ROOT members to share their lived experiences rather than standard star ratings, a clear pattern emerged in Nazareth and Tomas Saco: guests kept writing that they loved the baristas’ company so much that they wanted them at their private events.',
      'Responding directly to that community demand signal, micro-roasteries like Bowerbird Coffee Roasters have launched modular mobile espresso carts equipped with commercial dual-boiler machines and single-origin Bukidnon grinders.',
      'Whether it is an intimate garden wedding, a creative studio launch, or a weekend flea market, local specialty teams are proving that great hospitality travels.',
    ],
  },
  {
    id: 'news-velez-247-carwash',
    title:
      'The 24/7 Hybrid Wave on Velez Street: Express Carwashes, Midnight Coding Jams & High-Speed Fiber',
    subtitle:
      'How downtown workspaces are pairing everyday errands and late-night community sessions with specialty cold brew.',
    category: 'Promo & Perk',
    locationArea: 'Downtown & Velez',
    cafeId: 'bean-park-cdo',
    cafeName: 'Bean Park 24/7 Workspace Cafe',
    author: 'ROOT Movement Wire',
    publishedAt: 'Yesterday',
    readTime: '3 min read',
    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop',
    highlightPerk: 'Free Americano or Cold Brew with every full carwash service',
    body: [
      'Along Velez Street, convenience and productivity are merging in unexpected ways. Drivers are dropping off their cars for detailing while plugging in their laptops inside air-conditioned specialty coffee hubs.',
      'After 10 PM, the same tables fill up with remote software engineers, medical students, and night-shift creatives fueling up on 24/7 cold brew flights.',
      'Check the Map drawer for Bean Park 24/7 to claim this week’s carwash + espresso bundle or RSVP for Thursday’s midnight builder session.',
    ],
  },
  {
    id: 'news-bukidnon-harvest',
    title:
      'Bukidnon & Mt. Kitanglad Harvest Dispatch: Fresh Anaerobic Natural Lots Hit CDO Roasteries',
    subtitle:
      'Weekend public cuppings and rapid chess tournaments kick off across De Leon Street and Uptown.',
    category: 'Roaster Dispatch',
    locationArea: 'Bukidnon Highlands',
    cafeId: 'h-proper-coffee-roasters',
    cafeName: 'H Proper Coffee Roasters',
    author: 'Origin Desk',
    publishedAt: '2 days ago',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop',
    highlightPerk: 'Free public cupping flight every Saturday at 2:00 PM',
    body: [
      'Direct-trade harvests from smallholder farms in Bukidnon and the slopes of Mt. Kitanglad have finished resting and are now landing on espresso and filter bars across Cagayan de Oro.',
      'Expect bright stone-fruit acidity, cacao nib finish, and syrupy body on pour-over menus at H Proper Coffee Roasters, Milestone Coffee Roasters, and Fukuro Specialty Coffee.',
      'To celebrate the release, H Proper is pairing its Saturday rapid chess tournament with complimentary single-origin tasting flights for all registered players.',
    ],
  },
]

// --- Custom / Edited / Deleted Cafes Store ---

export function getCustomCafesMap(): Record<string, Cafe> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CUSTOM_CAFES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getDeletedCafeIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DELETED_CAFE_IDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAdminCafeOverride(cafe: Cafe): void {
  if (typeof window === 'undefined') return
  try {
    const map = getCustomCafesMap()
    map[cafe.id] = cafe
    localStorage.setItem(CUSTOM_CAFES_KEY, JSON.stringify(map))

    const deleted = getDeletedCafeIds().filter((id) => id !== cafe.id)
    localStorage.setItem(DELETED_CAFE_IDS_KEY, JSON.stringify(deleted))

    appendSystemLog({
      severity: 'INFO',
      source: 'Admin / CafeManager',
      message: `Saved coffee shop "${cafe.name}" (${cafe.id})`,
      details: `Location: ${cafe.location} · Status: ${cafe.status} · Hours: ${cafe.hours}`,
      statusCode: 200,
    })
  } catch {
    // Ignore storage error
  }
}

export function markCafeDeletedLocal(id: string, name?: string): void {
  if (typeof window === 'undefined') return
  try {
    const map = getCustomCafesMap()
    delete map[id]
    localStorage.setItem(CUSTOM_CAFES_KEY, JSON.stringify(map))

    const deleted = Array.from(new Set([...getDeletedCafeIds(), id]))
    localStorage.setItem(DELETED_CAFE_IDS_KEY, JSON.stringify(deleted))

    appendSystemLog({
      severity: 'WARNING',
      source: 'Admin / CafeManager',
      message: `Deleted coffee shop "${name || id}"`,
      details: `Removed cafe ID "${id}" from active directory and map.`,
      statusCode: 200,
    })
  } catch {
    // Ignore
  }
}

export function applyAdminCafeOverrides(baseCafes: Cafe[]): Cafe[] {
  if (typeof window === 'undefined') return baseCafes
  const deletedSet = new Set(getDeletedCafeIds())
  const customMap = getCustomCafesMap()

  const merged = baseCafes
    .filter((c) => !deletedSet.has(c.id))
    .map((c) => (customMap[c.id] ? { ...c, ...customMap[c.id] } : c))

  const existingIds = new Set(merged.map((c) => c.id))
  const brandNewCafes = Object.values(customMap).filter(
    (c) => !existingIds.has(c.id) && !deletedSet.has(c.id)
  )

  return [...brandNewCafes, ...merged]
}

// --- Users Store ---

export function getManagedUsers(): ManagedUser[] {
  if (typeof window === 'undefined') return DEFAULT_MANAGED_USERS
  try {
    const raw = localStorage.getItem(MANAGED_USERS_KEY)
    if (!raw) {
      localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(DEFAULT_MANAGED_USERS))
      return DEFAULT_MANAGED_USERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MANAGED_USERS
  } catch {
    return DEFAULT_MANAGED_USERS
  }
}

export function saveManagedUsers(users: ManagedUser[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users))
  } catch {
    // Ignore
  }
}

// --- System & Error Logs Store ---

export function getSystemLogs(): SystemLogEntry[] {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_LOGS
  try {
    const raw = localStorage.getItem(SYSTEM_LOGS_KEY)
    if (!raw) {
      localStorage.setItem(SYSTEM_LOGS_KEY, JSON.stringify(DEFAULT_SYSTEM_LOGS))
      return DEFAULT_SYSTEM_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SYSTEM_LOGS
  } catch {
    return DEFAULT_SYSTEM_LOGS
  }
}

export function saveSystemLogs(logs: SystemLogEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SYSTEM_LOGS_KEY, JSON.stringify(logs))
  } catch {
    // Ignore
  }
}

export function appendSystemLog(
  entry: Omit<SystemLogEntry, 'id' | 'timestamp' | 'resolved'> & { resolved?: boolean }
): SystemLogEntry {
  const current = getSystemLogs()
  const created: SystemLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    resolved: entry.resolved ?? false,
    ...entry,
  }
  const updated = [created, ...current.slice(0, 99)]
  saveSystemLogs(updated)
  return created
}

// --- News Outlet Store ---

export function getNewsArticles(): NewsArticle[] {
  if (typeof window === 'undefined') return DEFAULT_NEWS_ARTICLES
  try {
    const raw = localStorage.getItem(NEWS_ARTICLES_KEY)
    if (!raw) {
      localStorage.setItem(NEWS_ARTICLES_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES))
      return DEFAULT_NEWS_ARTICLES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NEWS_ARTICLES
  } catch {
    return DEFAULT_NEWS_ARTICLES
  }
}

export function addNewsArticle(
  article: Omit<NewsArticle, 'id' | 'publishedAt'>
): NewsArticle {
  const existing = getNewsArticles()
  const created: NewsArticle = {
    ...article,
    id: `news-${Date.now()}`,
    publishedAt: 'Just now',
  }
  const updated = [created, ...existing]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NEWS_ARTICLES_KEY, JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }
  appendSystemLog({
    severity: 'INFO',
    source: 'NewsOutlet / Dispatch',
    message: `Published city news article: "${created.title}"`,
    details: `Area: ${created.locationArea} · Category: ${created.category}`,
    statusCode: 201,
    resolved: true,
  })
  return created
}

export function deleteNewsArticle(id: string): NewsArticle[] {
  const existing = getNewsArticles()
  const updated = existing.filter((a) => a.id !== id)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NEWS_ARTICLES_KEY, JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }
  return updated
}

