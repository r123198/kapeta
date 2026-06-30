'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCafeFromSupabaseById, Cafe } from '@/lib/data'

export default function CafeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Find cafe & check bookmark state
  useEffect(() => {
    async function loadData() {
      const found = await getCafeFromSupabaseById(id)
      if (found) {
        setCafe(found)
        
        const saved = localStorage.getItem('root_bookmarks')
        if (saved) {
          try {
            const ids: string[] = JSON.parse(saved)
            setIsBookmarked(ids.includes(found.id))
          } catch (e) {
            console.error('Failed to parse bookmarks', e)
          }
        }
      }
      setMounted(true)
    }
    loadData()
  }, [id])

  const toggleBookmark = () => {
    if (!cafe) return
    const saved = localStorage.getItem('root_bookmarks')
    let ids: string[] = []
    if (saved) {
      try {
        ids = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }

    const updated = ids.includes(cafe.id)
      ? ids.filter((bId) => bId !== cafe.id)
      : [...ids, cafe.id]

    setIsBookmarked(updated.includes(cafe.id))
    localStorage.setItem('root_bookmarks', JSON.stringify(updated))
  }

  if (!mounted) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="font-mono text-label-caps text-secondary">Loading profile...</span>
        </div>
        <Footer />
      </div>
    )
  }

  if (!cafe) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary mb-4">
            warning
          </span>
          <h1 className="font-hanken text-headline-lg font-bold text-primary mb-2">Workspace Not Found</h1>
          <p className="font-sans text-body-lg text-secondary mb-8">
            The workspace profile you requested does not exist.
          </p>
          <Link 
            href="/"
            className="font-mono text-label-caps border border-primary px-6 py-3 text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            Back to Directory
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-on-surface bg-[#EDEDED] flex flex-col font-sans">
      <Navbar />

      {/* Main Canvas */}
      <main className="flex-grow flex justify-center p-4 md:p-grid-margin">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-[1px] bg-border-subtle border border-border-subtle shadow-sm">
          
          {/* Left Column: Hero & Review */}
          <div className="flex-grow flex-1 bg-canvas-white flex flex-col min-w-0">
            
            {/* Mobile Header Back Button */}
            <div className="md:hidden p-4 border-b border-border-subtle flex items-center gap-2">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-1 font-mono text-label-caps text-secondary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
            </div>

            {/* Hero Image */}
            <div className="h-64 sm:h-80 md:h-96 w-full relative">
              <img 
                className="w-full h-full object-cover grayscale-[10%]" 
                src={cafe.image} 
                alt={cafe.name} 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 pr-6">
                <h1 className="font-hanken text-[28px] md:text-headline-lg font-bold text-canvas-white uppercase tracking-tighter animate-fade-in-up">
                  {cafe.name}
                </h1>
                <p className="font-mono text-label-caps text-surface-alt mt-1.5">{cafe.location}</p>
              </div>
            </div>

            {/* Editorial Review */}
            <article className="p-6 md:p-stack-lg border-b border-border-subtle">
              <h2 className="font-hanken text-title-md text-primary mb-3 font-semibold uppercase tracking-wider">
                Editorial Note
              </h2>
              <div className="font-sans text-body-lg text-on-surface-variant space-y-4 leading-relaxed">
                <p>{cafe.review}</p>
                <p>
                  Every element, from the acoustics to the lighting fixtures, is selected to cater to the sensory experience. Whether looking to work or simply sit back and enjoy, this space has been vetted for productivity and aesthetic standards.
                </p>
              </div>
            </article>
          </div>

          {/* Right Column: Data Chunks & Actions */}
          <aside className="w-full md:w-80 lg:w-96 bg-canvas-white flex flex-col shrink-0 md:sticky md:top-32 md:h-[calc(100vh-10rem)] md:overflow-y-auto no-scrollbar">
            {/* Sticky Action Bar */}
            <div className="p-4 md:p-stack-md border-b border-border-subtle sticky top-0 bg-canvas-white z-10">
              <button 
                onClick={toggleBookmark}
                className="w-full py-3.5 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest"
              >
                <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-fill' : ''}`}>
                  {isBookmarked ? 'bookmark' : 'bookmark_add'}
                </span>
                {isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
              </button>
            </div>

            {/* The Vibe Table */}
            <div className="p-6 border-b border-border-subtle">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                The Vibe
              </h3>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">WiFi</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.wifi}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Outlets</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.outlets}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Seating</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.seating}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Noise</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.vibe.noise}</div>
              </div>
            </div>

            {/* The Coffee Table */}
            <div className="p-6">
              <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
                The Coffee
              </h3>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Roaster</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.roaster}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Beans</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.beans}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Espresso</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.espresso}</div>
                
                <div className="font-mono text-label-caps text-primary py-2 border-b border-border-subtle uppercase">Filter</div>
                <div className="font-sans text-body-sm text-on-surface-variant py-2 border-b border-border-subtle text-right">{cafe.coffee.filter}</div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  )
}
