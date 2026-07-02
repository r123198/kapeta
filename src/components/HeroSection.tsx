import Link from 'next/link'

interface HeroSectionProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export default function HeroSection({ searchQuery, setSearchQuery }: HeroSectionProps) {
  return (
    <section className="py-20 md:py-24 flex flex-col items-center justify-center text-center px-grid-margin relative overflow-hidden bg-surface border-b border-border-subtle">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#c4c7c7 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      />
      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        <h1 className="font-hanken text-[48px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter mb-4 leading-none">
           ROOT
        </h1>
        <p className="font-sans text-body-lg text-secondary max-w-lg mx-auto mb-8">
          A curated selection of the finest specialty coffee spaces and independent roasters worldwide.
        </p>

        {/* Search Bar + Map Button Row */}
        <div className="w-full max-w-2xl flex items-stretch gap-3">
          {/* Big Prominent Search Bar */}
          <div className="flex-grow relative flex items-center border-2 border-primary bg-canvas-white px-5 py-4 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 shadow-md">
            <span className="material-symbols-outlined text-primary text-[28px] mr-4">search</span>
            <input 
              className="bg-transparent border-none outline-none focus:ring-0 p-0 font-sans text-[18px] md:text-[22px] font-semibold w-full text-on-surface placeholder:text-outline/65" 
              placeholder="Search workspaces, cities, or roasters..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-secondary hover:text-primary transition-colors ml-2"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            )}
          </div>

          {/* Map Button */}
          <Link 
            href="/map"
            className="flex items-center justify-center gap-2 px-5 bg-primary text-on-primary border-2 border-primary hover:bg-tertiary-container transition-colors shadow-md shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">map</span>
            <span className="font-mono text-label-caps tracking-widest hidden sm:inline">Map</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
