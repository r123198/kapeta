'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, ExternalLink, Coffee, Laptop } from 'lucide-react'
import Tooltip from './Tooltip'
import { Cafe, resolveCafeImageUrl } from '@/lib/data'
import { CafeCuration } from '@/hooks/useBookmarks'

interface DirectoryCardProps {
  cafe: Cafe
  isBookmarked: boolean
  onToggleBookmark: (id: string, e: React.MouseEvent) => void
  curation?: CafeCuration
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop'

export default function DirectoryCard({
  cafe,
  isBookmarked,
  onToggleBookmark,
  curation,
}: DirectoryCardProps) {
  const [imgSrc, setImgSrc] = useState(() => resolveCafeImageUrl(cafe.image))
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article
      className="directory-card bg-canvas-white flex flex-col group relative border border-border-subtle transition-shadow duration-300 hover:shadow-lg will-change-[shadow]"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 450px',
      }}
    >
      {/* Save/Bookmark Button Overlay */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip content={isBookmarked ? 'Remove from Collection' : 'Save to Collection'}>
          <button
            onClick={(e) => onToggleBookmark(cafe.id, e)}
            className="bg-canvas-white text-primary p-2 border border-border-subtle hover:bg-surface-alt transition-colors duration-150 shadow-sm flex items-center justify-center"
            aria-label="Save workspace"
          >
            <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-primary text-primary' : 'text-secondary'}`} />
          </button>
        </Tooltip>
      </div>

      {/* Card Image Area — fixed aspect ratio prevents layout shift */}
      <div className="w-full aspect-[4/3] bg-surface-container-high relative overflow-hidden border-b border-border-subtle">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-surface-container-high animate-pulse" />
        )}
        <img
          className={`w-full h-full object-cover transition-[filter,transform] duration-500 ease-out grayscale group-hover:grayscale-0 scale-100 group-hover:scale-[1.03] will-change-transform ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={imgSrc}
          alt={cafe.name}
          loading="lazy"
          decoding="async"
          width={600}
          height={450}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgSrc(FALLBACK_IMAGE)
            setImgLoaded(true)
          }}
        />
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex flex-col shrink-0 bg-canvas-white">
        <h2 className="font-hanken text-title-md text-primary group-hover:underline decoration-1 underline-offset-4">
          <Link href={`/cafe/${cafe.id}`}>{cafe.name}</Link>
        </h2>

        {/* User's Curated Highlights (Always Visible when curated) */}
        {curation && (
          <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[9px] font-semibold uppercase tracking-wider">
                <Coffee className="w-2.5 h-2.5 text-emerald-700" />
                {curation.coffeeQuality}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[9px] font-medium uppercase tracking-wider">
                <Laptop className="w-2.5 h-2.5 text-amber-700" />
                {curation.workFriendly}
              </span>
              {curation.vibes.slice(0, 2).map((vibe) => (
                <span
                  key={vibe}
                  className="px-2 py-0.5 bg-surface-alt border border-border-subtle text-secondary font-mono text-[9px] uppercase tracking-wider"
                >
                  {vibe}
                </span>
              ))}
            </div>

            {curation.mustOrder && (
              <p className="font-mono text-[10px] text-primary">
                <span className="text-secondary uppercase">Go-to order:</span> {curation.mustOrder}
              </p>
            )}

            {curation.experienceNote && (
              <p className="font-sans text-body-sm text-secondary italic line-clamp-2">
                &ldquo;{curation.experienceNote}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Collapsible Details (GPU-accelerated slide) */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100 transition-[grid-template-rows,opacity] duration-[400ms] ease-out">
          <div className="overflow-hidden">
            {/* Location Block */}
            <div className="flex justify-between items-center py-3 border-y border-border-subtle mt-4 mb-4">
              <span className="font-mono text-label-caps text-secondary">Location</span>
              <span className="font-sans text-body-sm text-primary">{cafe.location}</span>
            </div>

            {/* Website Block */}
            <div className="flex justify-between items-center pb-4">
              <span className="font-mono text-label-caps text-secondary">Website</span>
              <a
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:text-secondary hover:border-primary transition-colors duration-150 border border-border-subtle bg-surface-alt px-3 py-1.5"
                href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Site
                <ExternalLink className="w-3.5 h-3.5" />
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
      </div>
    </article>
  )
}
