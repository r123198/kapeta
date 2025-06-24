import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TestimonialsSection from '@/components/TestimonialsSection'
import CoffeeShopListingSection from '@/components/CoffeeShopListingSection'
import MediaLogos from '@/components/MediaLogos'
import StickyBottomBanner from '@/components/StickyBottomBanner'
import { supabase } from '@/lib/supabase'

export const revalidate = 60 // Revalidate data every 60 seconds

async function getUserCount() {
  try {
    const { count } = await supabase
      .from('early_users')
      .select('*', { count: 'exact', head: true })
    
    return count || 0
  } catch (error) {
    console.error("Error fetching user count:", error)
    return 0
  }
}

export default async function Home() {
  const userCount = await getUserCount()

  return (
    <main className="min-h-screen">
      <Header />
      <Hero userCount={userCount} />
      <MediaLogos />
      <TestimonialsSection />
      <CoffeeShopListingSection />
      <StickyBottomBanner />
    </main>
  )
}
