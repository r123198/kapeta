import { supabase } from './supabase'
import {
  applyAdminCafeOverrides,
  saveAdminCafeOverride,
  markCafeDeletedLocal,
  getCustomCafesMap,
  getDeletedCafeIds,
} from './adminStore'

export interface CafeStats {
  taste: number;
  vibe: number;
  service: number;
  total: number;
}

export interface CafeVibe {
  wifi: string;
  outlets: string;
  seating: string;
  noise: string;
}

export interface CafeCoffee {
  roaster: string;
  beans: string;
  espresso: string;
  filter: string;
}

export interface CafeCoordinates {
  top: string; // percentage, e.g. "33.33%"
  left: string; // percentage, e.g. "25%"
}

export interface Cafe {
  id: string;
  name: string;
  location: string;
  neighborhood: string;
  website: string;
  image: string;
  type: string; // "INT" | "PRO" | "NEW" | "HM"
  stats: CafeStats;
  vibe: CafeVibe;
  coffee: CafeCoffee;
  review: string;
  coordinates: CafeCoordinates;
  status: 'Open' | 'Closed';
  hours: string;
  distance?: string;
  topFeature?: string;
  atmosphere?: string;
  latitude?: number;
  longitude?: number;
  promos?: string;
}

export const DEFAULT_CDO_CAFES: Cafe[] = [
  {
    id: 'h-proper-coffee-roasters',
    name: 'H Proper Coffee Roasters',
    location: 'De Leon St, Cagayan de Oro',
    neighborhood: 'Divisoria',
    website: 'https://hproper.com',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    type: 'PRO',
    stats: { taste: 9.4, vibe: 9.2, service: 9.1, total: 9.2 },
    vibe: { wifi: 'Fast (95 Mbps)', outlets: 'Abundant', seating: 'Communal & Bar', noise: 'Moderate' },
    coffee: { roaster: 'H Proper In-House Roastery', beans: 'Mt. Apo, Ethiopia, Colombia', espresso: 'La Marzocco Linea PB', filter: 'V60, Origami, Batch Brew' },
    review: 'Cagayan de Oro’s premier specialty coffee roaster, pairing world-class single-origin pour-overs with an airy, architectural workspace.',
    coordinates: { top: '45%', left: '52%' },
    status: 'Open',
    hours: '7:00 AM - 10:00 PM',
    distance: '0.4 MI',
    topFeature: '95 Mbps WiFi & In-House Roastery',
    atmosphere: 'Minimalist Industrial',
    latitude: 8.4772,
    longitude: 124.6459,
  },
  {
    id: 'bowerbird-coffee-cdo',
    name: 'Bowerbird Coffee Roasters',
    location: 'Tomas Saco St, Cagayan de Oro',
    neighborhood: 'Macasandig',
    website: 'https://instagram.com/bowerbirdcoffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    type: 'PRO',
    stats: { taste: 9.2, vibe: 9.0, service: 9.3, total: 9.2 },
    vibe: { wifi: 'Fast (60 Mbps)', outlets: 'Plentiful', seating: 'Indoor & Garden', noise: 'Quiet' },
    coffee: { roaster: 'Bowerbird Micro-Roastery', beans: 'Bukidnon & Mt. Kitanglad', espresso: 'Slayer Single Group', filter: 'Aeropress, V60, Kalita' },
    review: 'An intimate micro-roastery championing Northern Mindanao harvests from Bukidnon with precision brewing and quiet work corners.',
    coordinates: { top: '52%', left: '48%' },
    status: 'Open',
    hours: '8:00 AM - 9:00 PM',
    distance: '0.8 MI',
    topFeature: 'Bukidnon Single-Origin Roaster',
    atmosphere: 'Warm & Botanical',
    latitude: 8.4685,
    longitude: 124.6425,
  },
  {
    id: 'bean-park-cdo',
    name: 'Bean Park 24/7 Workspace Cafe',
    location: 'Velez St, Cagayan de Oro',
    neighborhood: 'Divisoria',
    website: 'https://beanparkcdo.com',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop',
    type: 'INT',
    stats: { taste: 8.6, vibe: 9.4, service: 8.9, total: 9.0 },
    vibe: { wifi: 'Fast (120 Mbps)', outlets: 'Every Table', seating: 'Ergonomic Desks & Booths', noise: 'Quiet Study' },
    coffee: { roaster: 'Local Mindanao Collective', beans: 'Mt. Matutum Arabica', espresso: 'Rocket Boxer', filter: 'Clever Dripper, Cold Brew' },
    review: 'Built specifically for late-night remote workers and founders in CDO, operating 24/7 with fiber internet and power outlets at every seat.',
    coordinates: { top: '40%', left: '50%' },
    status: 'Open',
    hours: '24/7',
    distance: '0.3 MI',
    topFeature: 'Open 24/7 • 120 Mbps Fiber WiFi',
    atmosphere: 'Focused Study & Work',
    latitude: 8.4811,
    longitude: 124.6442,
  },
  {
    id: 'maison-alessa-cdo',
    name: 'Maison Alessa',
    location: 'Corrales Ave, Cagayan de Oro',
    neighborhood: 'Downtown CDO',
    website: 'https://instagram.com/maisonalessa',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=600&auto=format&fit=crop',
    type: 'INT',
    stats: { taste: 8.9, vibe: 9.3, service: 9.0, total: 9.1 },
    vibe: { wifi: 'Fast (70 Mbps)', outlets: 'Abundant', seating: 'Long Tables & Lounge', noise: 'Moderate' },
    coffee: { roaster: 'Guest Specialty Roasters', beans: 'Cerrado & Bukidnon Blend', espresso: 'Nuova Simonelli Aurelia', filter: 'French Press, Pour Over' },
    review: 'Sunlit architectural interiors along Corrales Avenue with generous table space and dependable connectivity.',
    coordinates: { top: '38%', left: '55%' },
    status: 'Open',
    hours: '7:30 AM - 11:00 PM',
    distance: '0.6 MI',
    topFeature: '70 Mbps WiFi',
    atmosphere: 'Bright & Editorial',
    latitude: 8.4838,
    longitude: 124.6494,
  },
  {
    id: 'fukuro-coffee-cdo',
    name: 'Fukuro Specialty Coffee',
    location: 'Nazareth, Cagayan de Oro',
    neighborhood: 'Nazareth',
    website: 'https://instagram.com/fukurocdo',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
    type: 'INT',
    stats: { taste: 9.1, vibe: 9.0, service: 8.8, total: 9.0 },
    vibe: { wifi: 'Fast (50 Mbps)', outlets: 'Moderate', seating: 'Minimalist Counter & Tables', noise: 'Whisper Quiet' },
    coffee: { roaster: 'Kyoto & Local Guest Roasters', beans: 'Single Origin Ethiopia', espresso: 'Synesso MVP Hydra', filter: 'Hario Switch, V60' },
    review: 'Japandi-inspired slow bar in Nazareth offering tranquil acoustics and meticulous hand-poured filter coffee.',
    coordinates: { top: '58%', left: '53%' },
    status: 'Closed',
    hours: '9:00 AM - 8:00 PM',
    distance: '1.1 MI',
    topFeature: 'Slow Bar & Quiet Acoustics',
    atmosphere: 'Japandi Minimalist',
    latitude: 8.4632,
    longitude: 124.6478,
  },
  {
    id: 'milestone-coffee-cdo',
    name: 'Milestone Coffee Roasters',
    location: 'Masterson Ave, Uptown Cagayan de Oro',
    neighborhood: 'Uptown CDO',
    website: 'https://milestonecoffee.ph',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop',
    type: 'PRO',
    stats: { taste: 9.0, vibe: 9.1, service: 9.0, total: 9.0 },
    vibe: { wifi: 'Fast (85 Mbps)', outlets: 'Abundant', seating: 'Spacious Loft', noise: 'Low' },
    coffee: { roaster: 'Milestone In-House Roasters', beans: 'Pangantucan Bukidnon', espresso: 'Victoria Arduino Eagle One', filter: 'Chemex, V60' },
    review: 'Uptown CDO’s 24/7 roastery and workspace hub overlooking Pueblo de Oro, roasting high-elevation Bukidnon beans daily.',
    coordinates: { top: '65%', left: '35%' },
    status: 'Open',
    hours: '24/7',
    distance: '2.1 MI',
    topFeature: '24/7 Roastery & Workspace',
    atmosphere: 'Modern Loft',
    latitude: 8.4426,
    longitude: 124.6215,
  },
];

export const cafes: Cafe[] = [...DEFAULT_CDO_CAFES];

export function isCafeRoastery(cafe: Cafe): boolean {
  const nameLower = cafe.name.toLowerCase();
  const roasterLower = (cafe.coffee?.roaster || '').toLowerCase();
  return (
    cafe.type === 'PRO' ||
    nameLower.includes('roast') ||
    nameLower.includes('grind') ||
    roasterLower.includes('in-house') ||
    roasterLower.includes('micro-roastery')
  );
}

export function isCafe24Hours(cafe: Cafe): boolean {
  const hoursLower = (cafe.hours || '').toLowerCase();
  const topLower = (cafe.topFeature || '').toLowerCase();
  return (
    hoursLower.includes('24/7') ||
    hoursLower.includes('24 hours') ||
    hoursLower.includes('24 hrs') ||
    topLower.includes('24/7')
  );
}

export function getCafeImages(cafe: Cafe): string[] {
  const baseImages = cafe.image
    ? cafe.image.split(',').map((img) => resolveCafeImageUrl(img.trim())).filter(Boolean)
    : [];
  const galleryFallbacks = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop',
  ];
  const combined = [...baseImages];
  for (const fb of galleryFallbacks) {
    if (combined.length >= 3) break;
    if (!combined.includes(fb)) combined.push(fb);
  }
  return combined;
}

// Resolve image URLs from Supabase Storage bucket with fallback
export function resolveCafeImageUrl(image: string | null | undefined): string {
  const fallbackImage = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
  
  if (!image || image.trim() === '') {
    return fallbackImage;
  }
  
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgfzfzfvybdndkfglyoj.supabase.co';
  
  // Clean up potential duplicate leading slash
  let cleanPath = image.trim();
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // If the path doesn't start with the bucket folder, prepend it (e.g. cafe-images)
  if (!cleanPath.startsWith('cafe-images/')) {
    cleanPath = `cafe-images/${cleanPath}`;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}

// Mapping function from Supabase flat structure to Cafe nested structure
export function mapDbToCafe(row: any): Cafe {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    neighborhood: row.neighborhood,
    website: row.website || '',
    image: resolveCafeImageUrl(row.image),
    type: row.type,
    stats: {
      taste: Number(row.taste_score || 0),
      vibe: Number(row.vibe_score || 0),
      service: Number(row.service_score || 0),
      total: Number(row.total_score || 0),
    },
    vibe: {
      wifi: row.wifi || '',
      outlets: row.outlets || '',
      seating: row.seating || '',
      noise: row.noise || '',
    },
    coffee: {
      roaster: row.roaster || '',
      beans: row.beans || '',
      espresso: row.espresso || '',
      filter: row.filter || '',
    },
    review: row.review || '',
    coordinates: {
      top: row.coord_top || '0%',
      left: row.coord_left || '0%',
    },
    status: (row.status === 'Closed' ? 'Closed' : 'Open'),
    hours: row.hours || '',
    distance: row.distance || '',
    topFeature: row.top_feature || '',
    atmosphere: row.atmosphere || '',
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : undefined,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : undefined,
    promos: row.promos || '',
  }
}

// Fallback defaults for coordinates Y/X
export function getCafeDefaultLatitude(id: string): number | null {
  const fallbacks: Record<string, number> = {
    'sey-coffee': 40.705244,
    'onyx-coffee-lab': 36.331505,
    'kurasu': 34.985822,
    'la-cabra': 56.151842,
    'ozone-coffee-roasters': 51.526233,
    'prufrock-coffee': 51.521544,
    'watchhouse': 51.498411,
    // Iligan City neighborhood coordinates
    'brew-grind-co': 8.2412,
    'tibanga-terrace': 8.2448,
    'msu-coffee-hub': 8.2395,
    'university-grounds': 8.2368,
    'cafe-palao': 8.2275,
    'palao-perk': 8.2248,
    'city-center-espresso': 8.2289,
    'kape-alley': 8.2315,
    'mahayahay-brew': 8.2192,
    'tambo-coffee-corner': 8.2342,
    // Cagayan de Oro coordinates
    'h-proper-coffee-roasters': 8.4772,
    'bowerbird-coffee-cdo': 8.4685,
    'bean-park-cdo': 8.4811,
    'maison-alessa-cdo': 8.4838,
    'fukuro-coffee-cdo': 8.4632,
    'milestone-coffee-cdo': 8.4426,
  };
  return fallbacks[id] ?? null;
}

export function getCafeDefaultLongitude(id: string): number | null {
  const fallbacks: Record<string, number> = {
    'sey-coffee': -73.931221,
    'onyx-coffee-lab': -94.118503,
    'kurasu': 135.758012,
    'la-cabra': 10.206404,
    'ozone-coffee-roasters': -0.086311,
    'prufrock-coffee': -0.108612,
    'watchhouse': -0.076622,
    // Iligan City neighborhood coordinates
    'brew-grind-co': 124.2442,
    'tibanga-terrace': 124.2468,
    'msu-coffee-hub': 124.2435,
    'university-grounds': 124.2418,
    'cafe-palao': 124.2532,
    'palao-perk': 124.2561,
    'city-center-espresso': 124.2385,
    'kape-alley': 124.2408,
    'mahayahay-brew': 124.2485,
    'tambo-coffee-corner': 124.2512,
    // Cagayan de Oro coordinates
    'h-proper-coffee-roasters': 124.6459,
    'bowerbird-coffee-cdo': 124.6425,
    'bean-park-cdo': 124.6442,
    'maison-alessa-cdo': 124.6494,
    'fukuro-coffee-cdo': 124.6478,
    'milestone-coffee-cdo': 124.6215,
  };
  return fallbacks[id] ?? null;
}

// Resolve coordinates with database data, fallbacks for default cafes, and a general fallback (Iligan City center)
export function getCafeCoordinates(cafe: Cafe): [number, number] {
  const isGenericIliganPlaceholder =
    cafe.latitude !== undefined &&
    cafe.longitude !== undefined &&
    Math.abs(cafe.latitude - 8.228023) < 0.0001 &&
    Math.abs(cafe.longitude - 124.245242) < 0.0001;

  if (
    cafe.latitude !== undefined &&
    cafe.latitude !== null &&
    cafe.longitude !== undefined &&
    cafe.longitude !== null &&
    !isGenericIliganPlaceholder
  ) {
    return [cafe.latitude, cafe.longitude];
  }
  
  const lat = getCafeDefaultLatitude(cafe.id);
  const lng = getCafeDefaultLongitude(cafe.id);
  
  if (lat !== null && lng !== null) {
    return [lat, lng];
  }
  
  return [8.228023, 124.245242]; // General default fallback (Iligan City, PH)
}

// Mapping function from Cafe nested structure to Supabase flat structure
export function mapCafeToDb(cafe: Cafe): any {
  return {
    id: cafe.id,
    name: cafe.name,
    location: cafe.location,
    neighborhood: cafe.neighborhood,
    website: cafe.website,
    image: cafe.image,
    type: cafe.type,
    taste_score: cafe.stats.taste,
    vibe_score: cafe.stats.vibe,
    service_score: cafe.stats.service,
    total_score: cafe.stats.total,
    wifi: cafe.vibe.wifi,
    outlets: cafe.vibe.outlets,
    seating: cafe.vibe.seating,
    noise: cafe.vibe.noise,
    roaster: cafe.coffee.roaster,
    beans: cafe.coffee.beans,
    espresso: cafe.coffee.espresso,
    filter: cafe.coffee.filter,
    review: cafe.review,
    coord_top: cafe.coordinates.top,
    coord_left: cafe.coordinates.left,
    status: cafe.status,
    hours: cafe.hours,
    distance: cafe.distance,
    top_feature: cafe.topFeature,
    atmosphere: cafe.atmosphere,
    latitude: cafe.latitude !== undefined ? cafe.latitude : (getCafeDefaultLatitude(cafe.id) ?? undefined),
    longitude: cafe.longitude !== undefined ? cafe.longitude : (getCafeDefaultLongitude(cafe.id) ?? undefined),
    promos: cafe.promos,
  }
}

// Fetch all cafes from Supabase
export async function getCafesFromSupabase(): Promise<Cafe[]> {
  const fallbackCafes = [
    ...cafes,
    ...DEFAULT_CDO_CAFES.filter((c) => !cafes.some((existing) => existing.id === c.id)),
  ]
  try {
    const queryPromise = supabase
      .from('cafes')
      .select('*')
      .order('name', { ascending: true })

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase fetch timeout') }), 5000)
    )

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('Falling back to local cafes data:', error.message || error)
      }
      return applyAdminCafeOverrides(fallbackCafes)
    }

    const dbCafes = data.map((row: any) => {
      const mapped = mapDbToCafe(row)
      if (mapped.id === 'msu-coffee-hub' && mapped.hours === '8:00 AM - 9:00 PM') {
        mapped.hours = '24/7'
      }
      return mapped
    })
    const existingIds = new Set(dbCafes.map((c: Cafe) => c.id))
    const merged = [
      ...dbCafes,
      ...DEFAULT_CDO_CAFES.filter((c) => !existingIds.has(c.id)),
    ]
    return applyAdminCafeOverrides(merged)
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err)
    return applyAdminCafeOverrides(fallbackCafes)
  }
}

// Fetch a single cafe by ID from Supabase
export async function getCafeFromSupabaseById(id: string): Promise<Cafe | null> {
  if (typeof window !== 'undefined' && getDeletedCafeIds().includes(id)) {
    return null
  }
  const customOverride = typeof window !== 'undefined' ? getCustomCafesMap()[id] : undefined
  const localMatch =
    customOverride ||
    DEFAULT_CDO_CAFES.find((c) => c.id === id) ||
    cafes.find((c) => c.id === id) ||
    null
  try {
    const queryPromise = supabase
      .from('cafes')
      .select('*')
      .eq('id', id)
      .single()

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Supabase fetch timeout') }), 5000)
    )

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error || !data) {
      return localMatch
    }

    const mapped = mapDbToCafe(data)
    if (mapped.id === 'msu-coffee-hub' && mapped.hours === '8:00 AM - 9:00 PM') {
      mapped.hours = '24/7'
    }
    return customOverride ? { ...mapped, ...customOverride } : mapped
  } catch (err) {
    console.error(`Unexpected error fetching cafe ${id} from Supabase:`, err)
    return localMatch
  }
}

// Seed Supabase with local mock data
export async function seedSupabaseWithMockData(): Promise<{ success: boolean; count: number; error?: any }> {
  try {
    // 1. Delete all existing cafes to avoid duplication on re-seed
    const { error: deleteError } = await supabase
      .from('cafes')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00Z') // deletes all rows

    if (deleteError) {
      throw deleteError
    }

    // 2. Prepare seed rows
    const seedRows = cafes.map(mapCafeToDb)

    // 3. Insert mock data
    const { data, error: insertError } = await supabase
      .from('cafes')
      .insert(seedRows)
      .select()

    if (insertError) {
      throw insertError
    }

    return { success: true, count: data?.length || 0 }
  } catch (err: any) {
    console.error('Seeding failed:', err)
    return { success: false, count: 0, error: err }
  }
}

// Insert cafe
export async function insertCafeToSupabase(cafe: Cafe): Promise<{ success: boolean; error?: any }> {
  saveAdminCafeOverride(cafe)
  try {
    const dbRow = mapCafeToDb(cafe)
    const { error } = await supabase
      .from('cafes')
      .insert([dbRow])

    if (error) {
      console.warn('Supabase insert warning (saved locally):', error.message || error)
    }
    return { success: true }
  } catch (err: any) {
    console.warn('Insert saved locally:', err)
    return { success: true }
  }
}

// Update cafe
export async function updateCafeInSupabase(id: string, cafe: Cafe): Promise<{ success: boolean; error?: any }> {
  saveAdminCafeOverride(cafe)
  try {
    const dbRow = mapCafeToDb(cafe)
    const { error } = await supabase
      .from('cafes')
      .update(dbRow)
      .eq('id', id)

    if (error) {
      console.warn('Supabase update warning (saved locally):', error.message || error)
    }
    return { success: true }
  } catch (err: any) {
    console.warn('Update saved locally:', err)
    return { success: true }
  }
}

// Delete cafe
export async function deleteCafeFromSupabase(id: string, name?: string): Promise<{ success: boolean; error?: any }> {
  markCafeDeletedLocal(id, name)
  try {
    const { error } = await supabase
      .from('cafes')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Supabase delete warning (deleted locally):', error.message || error)
    }
    return { success: true }
  } catch (err: any) {
    console.warn('Delete applied locally:', err)
    return { success: true }
  }
}

// Socials / Contact fallback data
export interface CafeSocials {
  phone: string
  email: string
  instagram: string
  facebook: string
}

export function getSocials(cafeId: string): CafeSocials {
  const fallbacks: Record<string, CafeSocials> = {
    'sey-coffee': {
      phone: '+1 (347) 878-8400',
      email: 'info@seycoffee.com',
      instagram: '@seycoffee',
      facebook: 'facebook.com/seycoffee'
    },
    'onyx-coffee-lab': {
      phone: '+1 (479) 715-6492',
      email: 'info@onyxcoffeelab.com',
      instagram: '@onyxcoffeelab',
      facebook: 'facebook.com/onyxcoffeelab'
    },
    'kurasu': {
      phone: '+81 75-222-5077',
      email: 'co-op@kurasu.kyoto',
      instagram: '@kurasu.kyoto',
      facebook: 'facebook.com/kurasukyoto'
    },
    'la-cabra': {
      phone: '+45 88 44 14 00',
      email: 'webshop@lacabra.dk',
      instagram: '@lacabra.coffee',
      facebook: 'facebook.com/lacabracoffee'
    },
    'ozone-coffee-roasters': {
      phone: '+44 20 7490 9710',
      email: 'london@ozonecoffee.co.uk',
      instagram: '@ozonecoffeeroasters',
      facebook: 'facebook.com/ozonecoffeeroasters'
    },
    'prufrock-coffee': {
      phone: '+44 20 7242 7467',
      email: 'info@prufrockcoffee.com',
      instagram: '@prufrockcoffee',
      facebook: 'facebook.com/prufrockcoffee'
    },
    'watchhouse': {
      phone: '+44 20 7407 6599',
      email: 'bermondsey@watchhouse.com',
      instagram: '@watchhouse',
      facebook: 'facebook.com/watchhouse'
    }
  }
  return fallbacks[cafeId] || {
    phone: '+63 917 123 4567',
    email: `hello@${cafeId}.com`,
    instagram: `@${cafeId}`,
    facebook: `facebook.com/${cafeId}`
  }
}
