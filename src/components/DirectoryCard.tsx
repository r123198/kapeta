'use client'

import Link from 'next/link'
import Tooltip from './Tooltip'
import { Cafe } from '@/lib/data'

interface DirectoryCardProps {
  cafe: Cafe
  isBookmarked: boolean
  onToggleBookmark: (id: string, e: React.MouseEvent) => void
}

export default function DirectoryCard({ cafe, isBookmarked, onToggleBookmark }: DirectoryCardProps) {
  return (
    <article className="bg-canvas-white flex flex-col group relative border border-border-subtle min-h-[350px] transition-all duration-300">
      {/* Save/Bookmark Button Overlay - Moved outside Image Area so tooltip isn't clipped */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Tooltip content={isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}>
          <button
            onClick={(e) => onToggleBookmark(cafe.id, e)}
            className="bg-canvas-white text-primary p-2 border border-border-subtle hover:bg-surface-alt transition-colors shadow-sm flex items-center justify-center animate-none"
            aria-label="Save workspace"
          >
            <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-fill text-primary' : 'text-secondary'}`}>
              bookmark
            </span>
          </button>
        </Tooltip>
      </div>

      {/* Card Image Area */}
      <div className="w-full bg-surface-container-high relative overflow-hidden border-b border-border-subtle flex-grow">
        <img 
          className="w-full h-full min-h-[220px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105" 
          src={cafe.image}
          alt={cafe.name}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
          }}
        />
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex flex-col shrink-0 bg-canvas-white">
        <h2 className="font-hanken text-title-md text-primary group-hover:underline decoration-1 underline-offset-4">
          <Link href={`/cafe/${cafe.id}`}>{cafe.name}</Link>
        </h2>
        
        {/* Collapsible Details Container (Slide up and expand on hover) */}
        <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 overflow-hidden group-hover:overflow-visible transition-all duration-500 ease-in-out">
          
          {/* Location Block */}
          <div className="flex justify-between items-center py-3 border-y border-border-subtle mt-4 mb-4">
            <span className="font-mono text-label-caps text-secondary">Location</span>
            <span className="font-sans text-body-sm text-primary">{cafe.location}</span>
          </div>

          {/* Website Block */}
          <div className="flex justify-between items-center pb-4">
            <span className="font-mono text-label-caps text-secondary">Website</span>
            <a 
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:text-secondary hover:border-primary transition-colors border border-border-subtle bg-surface-alt px-3 py-1.5" 
              href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Site
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>

          {/* Stats Table Block */}
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="grid grid-cols-4 border border-border-subtle divide-x divide-border-subtle text-center">
              
              <Tooltip content="Taste Score (0-10)">
                <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                  <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">TST</span>
                  <span className="font-mono text-label-caps text-primary">{cafe.stats.taste.toFixed(1)}</span>
                </div>
              </Tooltip>

              <Tooltip content="Vibe Score (0-10)">
                <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                  <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">VIB</span>
                  <span className="font-mono text-label-caps text-primary">{cafe.stats.vibe.toFixed(1)}</span>
                </div>
              </Tooltip>

              <Tooltip content="Service Score (0-10)">
                <div className="p-1.5 flex flex-col justify-center bg-surface-container-lowest cursor-help h-full">
                  <span className="font-mono text-[9px] tracking-widest text-secondary border-b border-border-subtle pb-1 mb-1">SRV</span>
                  <span className="font-mono text-label-caps text-primary">{cafe.stats.service.toFixed(1)}</span>
                </div>
              </Tooltip>

              <Tooltip content="Total Overall Score (0-10)">
                <div className="p-1.5 flex flex-col justify-center bg-primary text-on-primary cursor-help h-full">
                  <span className="font-mono text-[9px] tracking-widest border-b border-on-primary/30 pb-1 mb-1">TOT</span>
                  <span className="font-mono text-label-caps">{cafe.stats.total.toFixed(1)}</span>
                </div>
              </Tooltip>

            </div>
          </div>

        </div>
      </div>
    </article>
  )
}
