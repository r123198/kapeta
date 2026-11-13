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
      <div className="absolute top-3 right-3 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip content={isBookmarked ? 'Remove from Collection' : 'Save to Collection'}>
          <button
            onClick={(e) => onToggleBookmark(cafe.id, e)}
            className="bg-canvas-white/95 text-primary p-2 border border-border-subtle hover:bg-surface-alt transition-colors duration-150 shadow-sm flex items-center justify-center"
            aria-label="Save workspace"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary text-primary' : 'text-secondary'}`} />
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
      <div className="p-5 flex flex-col flex-grow justify-between bg-canvas-white">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-hanken text-title-md font-bold text-primary group-hover:underline decoration-1 underline-offset-4">
                <Link href={`/cafe/${cafe.id}`}>{cafe.name}</Link>
              </h2>
              <p className="font-sans text-body-sm text-secondary mt-0.5">
                {cafe.neighborhood || cafe.location}
              </p>
            </div>
            <div className="px-2 py-1 bg-primary text-on-primary font-mono text-xs font-bold shrink-0">
              {cafe.stats.total.toFixed(1)}
            </div>
          </div>

          {/* User's Curated Highlights */}
          {curation ? (
            <div className="mt-4 pt-3.5 border-t border-border-subtle space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-medium uppercase tracking-wider">
                  <Coffee className="w-3 h-3 text-emerald-700" />
                  {curation.coffeeQuality}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[10px] font-medium uppercase tracking-wider">
                  <Laptop className="w-3 h-3 text-amber-700" />
                  {curation.workFriendly}
                </span>
              </div>

              {curation.mustOrder && (
                <p className="font-sans text-xs text-primary">
                  <span className="font-mono text-[10px] text-secondary uppercase tracking-wider mr-1.5">
                    Order:
                  </span>
                  {curation.mustOrder}
                </p>
              )}

              {curation.experienceNote && (
                <p className="font-sans text-body-sm text-secondary italic line-clamp-2">
                  &ldquo;{curation.experienceNote}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="font-sans text-body-sm text-secondary mt-3 line-clamp-2">
              {cafe.review}
            </p>
          )}
        </div>

        {/* Footer Metadata & Action */}
        <div className="mt-5 pt-3.5 border-t border-border-subtle flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-mono text-[11px] text-secondary">
            <span>Taste {cafe.stats.taste.toFixed(1)}</span>
            <span>·</span>
            <span>Vibe {cafe.stats.vibe.toFixed(1)}</span>
          </div>

          <a
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline"
            href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  )
}
