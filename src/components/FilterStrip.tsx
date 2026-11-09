'use client'

import { ChevronDown, RotateCcw, X, SlidersHorizontal } from 'lucide-react'

interface FilterStripProps {
  isOpen: boolean
  onClose: () => void
  selectedType: string
  setSelectedType: (val: string) => void
  selectedCountry: string
  setSelectedCountry: (val: string) => void
  onReset: () => void
  showReset: boolean
}

export default function FilterStrip({
  isOpen,
  onClose,
  selectedType,
  setSelectedType,
  selectedCountry,
  setSelectedCountry,
  onReset,
  showReset,
}: FilterStripProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Collection Filters"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-canvas-white border-l border-border-subtle z-50 flex flex-col shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="font-hanken text-title-md font-bold text-primary">
              Filters
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors"
            aria-label="Close filters"
          >
            <X className="w-4 h-4 text-primary" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-grow overflow-y-auto">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary mb-2">
              Space Type
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none bg-canvas-white border border-border-subtle px-3 py-2.5 pr-8 font-mono text-label-caps text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
              >
                <option value="ALL">TYPE: ALL</option>
                <option value="INT">INT (Interior)</option>
                <option value="PRO">PRO (Roaster)</option>
                <option value="NEW">NEW (New Space)</option>
                <option value="HM">HM (Historic)</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary mb-2">
              Location / Region
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full appearance-none bg-canvas-white border border-border-subtle px-3 py-2.5 pr-8 font-mono text-label-caps text-primary cursor-pointer focus:ring-0 focus:outline-none rounded-none"
              >
                <option value="ALL">LOCATION: ALL</option>
                <option value="CDO">CAGAYAN DE ORO</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>
        </div>

        {showReset && (
          <div className="p-5 border-t border-border-subtle">
            <button
              type="button"
              onClick={onReset}
              className="w-full py-2.5 border border-border-subtle hover:border-primary flex items-center justify-center gap-2 text-secondary hover:text-primary transition-colors font-mono text-label-caps uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
