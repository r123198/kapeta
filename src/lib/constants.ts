import { Wifi, Coffee, Users, Star, Sparkles, Gift } from 'lucide-react'

export const TESTIMONIALS = [
  {
    quote: "ROOT helps me find coffee shops that are perfect for remote work in Iligan, based on factors like wifi speed, noise level, and coffee quality",
    publication: "Local News Iligan"
  },
  {
    quote: "The ratings of ROOT's cafes are constantly updated in real-time based on user input from the local coffee community",
    publication: "Mindanao Daily"
  },
  {
    quote: "ROOT is a local aggregator for coffee destinations, ranking wifi, coffee beans, and work environment",
    publication: "TechNews PH"
  }
]

export const FEATURED_CARDS = [
  {
    type: 'top_rated',
    title: 'Top Rated',
    description: 'Kape Alley (4.8/5)',
    icon: Star,
    bgColor: 'bg-accent/10',
    iconColor: 'text-accent'
  },
  {
    type: 'new_cafe',
    title: 'New Cafe',
    description: 'Mahayahay Brew just opened!',
    icon: Sparkles,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    type: 'promo',
    title: 'Promo',
    description: 'Free 2nd cup at Brew & Grind Co',
    icon: Gift,
    bgColor: 'bg-warning/10',
    iconColor: 'text-warning'
  }
]

export const MEDIA_LOGOS = [
  { name: 'Iligan Times', placeholder: 'IT' },
  { name: 'Coffee Blog PH', placeholder: 'CB' },
  { name: 'Local Cafe Guide', placeholder: 'LCG' },
  { name: 'Digital Nomads PH', placeholder: 'DNP' },
  { name: 'Iligan Chamber', placeholder: 'IC' }
]

export const NAVIGATION_LINKS = [
  { label: 'Directory', path: '/' },
  { label: 'Map', path: '/map' },
  { label: 'Bookmarks', path: '/bookmarks' },
  { label: 'Admin', path: '/admin' }
]

export const HEADER_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Log in', href: '#login' }
]

export const FOOTER_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Cookies', href: '#' },
  { label: 'Instagram', href: '#' }
]

export const FEATURES_DATA = [
  {
    icon: Wifi,
    title: "Know Before You Go",
    description: "Wifi speed, noise level, outlet availability, and workspace vibes. No more guessing games when choosing your work spot.",
    highlights: ["Real-time wifi speeds", "Noise level ratings", "Power outlet maps", "Workspace photos"]
  },
  {
    icon: Coffee,
    title: "Coffee Enthusiast Details",
    description: "Bean origin, roast type, barista insights, and brewing methods. For those who appreciate the art of coffee.",
    highlights: ["Bean origin tracking", "Roast level details", "Barista recommendations", "Brewing methods"]
  },
  {
    icon: Users,
    title: "Remote Work Community",
    description: "Connect with fellow remote workers, get exclusive deals, and join coffee meetups. Build your local network.",
    highlights: ["Community meetups", "Exclusive discounts", "Networking events", "Member-only perks"]
  }
]
