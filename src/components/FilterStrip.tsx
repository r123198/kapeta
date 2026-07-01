'use client'

interface FilterStripProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedType: string
  setSelectedType: (val: string) => void
  selectedCountry: string
  setSelectedCountry: (val: string) => void
  onReset: () => void
  showReset: boolean
}

export default function FilterStrip({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedCountry,
  setSelectedCountry,
  onReset,
  showReset,
}: FilterStripProps) {
  return (
    <div className="border-b border-border-subtle bg-surface px-grid-margin py-4 sticky top-16 z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Filter Selects */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-canvas-white border border-border-subtle px-3 py-1.5 pr-8 font-mono text-label-caps text-secondary hover:text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
            >
              <option value="ALL">TYPE: ALL</option>
              <option value="INT">INT (Interior)</option>
              <option value="PRO">PRO (Roaster)</option>
              <option value="NEW">NEW (New Space)</option>
              <option value="HM">HM (Historic)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Country Filter */}
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="appearance-none bg-canvas-white border border-border-subtle px-3 py-1.5 pr-8 font-mono text-label-caps text-secondary hover:text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
            >
              <option value="ALL">COUNTRY: ALL</option>
              <option value="US">UNITED STATES</option>
              <option value="JP">JAPAN</option>
              <option value="DK">DENMARK</option>
              <option value="UK">UNITED KINGDOM</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Right: Reset Action */}
        {showReset && (
          <button 
            onClick={onReset}
            className="flex items-center gap-2 cursor-pointer text-secondary hover:text-primary transition-colors font-mono text-label-caps self-start md:self-auto"
          >
            <span>Reset filters</span>
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        )}
      </div>
    </div>
  )
}
