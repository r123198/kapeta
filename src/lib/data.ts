import { supabase } from './supabase'

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
}

export const cafes: Cafe[] = [];

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
    'watchhouse': 51.498411
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
    'watchhouse': -0.076622
  };
  return fallbacks[id] ?? null;
}

// Resolve coordinates with database data, fallbacks for default cafes, and a general fallback (Iligan City center)
export function getCafeCoordinates(cafe: Cafe): [number, number] {
  if (cafe.latitude !== undefined && cafe.latitude !== null) {
    return [cafe.latitude, cafe.longitude!];
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
  }
}

// Fetch all cafes from Supabase
export async function getCafesFromSupabase(): Promise<Cafe[]> {
  try {
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching cafes from Supabase:', error)
      return []
    }

    if (!data) {
      return []
    }

    return data.map(mapDbToCafe)
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err)
    return []
  }
}

// Fetch a single cafe by ID from Supabase
export async function getCafeFromSupabaseById(id: string): Promise<Cafe | null> {
  try {
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching cafe ${id} from Supabase:`, error)
      return null
    }

    if (!data) {
      return null
    }

    return mapDbToCafe(data)
  } catch (err) {
    console.error(`Unexpected error fetching cafe ${id} from Supabase:`, err)
    return null
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
  try {
    const dbRow = mapCafeToDb(cafe)
    const { error } = await supabase
      .from('cafes')
      .insert([dbRow])

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Insert failed:', err)
    return { success: false, error: err }
  }
}

// Update cafe
export async function updateCafeInSupabase(id: string, cafe: Cafe): Promise<{ success: boolean; error?: any }> {
  try {
    const dbRow = mapCafeToDb(cafe)
    const { error } = await supabase
      .from('cafes')
      .update(dbRow)
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Update failed:', err)
    return { success: false, error: err }
  }
}

// Delete cafe
export async function deleteCafeFromSupabase(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('cafes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Delete failed:', err)
    return { success: false, error: err }
  }
}

