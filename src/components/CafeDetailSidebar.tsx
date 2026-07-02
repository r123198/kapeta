import Tooltip from '@/components/Tooltip'
import { Cafe, CafeSocials } from '@/lib/data'

interface CafeDetailSidebarProps {
  cafe: Cafe
  socials: CafeSocials
  isBookmarked: boolean
  onToggleBookmark: () => void
}

export default function CafeDetailSidebar({ cafe, socials, isBookmarked, onToggleBookmark }: CafeDetailSidebarProps) {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-canvas-white flex flex-col shrink-0 md:sticky md:top-32 md:h-[calc(100vh-14rem)] md:overflow-y-auto no-scrollbar">
      
      {/* Desktop Action Bar */}
      <div className="hidden md:block p-4 md:p-stack-md border-b border-border-subtle sticky top-0 bg-canvas-white z-10">
        <button 
          onClick={onToggleBookmark}
          className="w-full py-3.5 bg-primary text-on-primary font-mono text-label-caps flex items-center justify-center gap-2 hover:bg-tertiary-container transition-colors uppercase tracking-widest"
        >
          <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-fill' : ''}`}>
            {isBookmarked ? 'bookmark' : 'bookmark_add'}
          </span>
          {isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
        </button>
      </div>

      {/* Quality Ratings */}
      <div className="p-6 border-b border-border-subtle">
        <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
          Specialty Scores
        </h3>
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
      <div className="p-6 border-b border-border-subtle">
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

      {/* Contact & Socials Table */}
      <div className="p-6">
        <h3 className="font-mono text-label-caps text-secondary mb-4 uppercase tracking-widest font-semibold">
          Contact & Socials
        </h3>
        <div className="space-y-3.5">
          
          {/* Website */}
          <a 
            href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Website</span>
            </div>
            <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary group-hover/contact:underline flex items-center gap-1.5 font-medium">
              Visit Site
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </span>
          </a>

          {/* Phone */}
          <a 
            href={`tel:${socials.phone.replace(/[^+\d]/g, '')}`}
            className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Phone</span>
            </div>
            <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
              {socials.phone}
            </span>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${socials.email}`}
            className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Email</span>
            </div>
            <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium truncate max-w-[160px]">
              {socials.email}
            </span>
          </a>

          {/* Instagram */}
          <a 
            href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Instagram</span>
            </div>
            <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
              {socials.instagram}
            </span>
          </a>

          {/* Facebook */}
          <a 
            href={`https://${socials.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-border-subtle bg-surface-container-lowest hover:border-primary hover:bg-surface-alt transition-all group/contact"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-secondary group-hover/contact:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span className="font-mono text-label-caps text-[10px] text-primary tracking-widest">Facebook</span>
            </div>
            <span className="font-sans text-body-sm text-on-surface-variant group-hover/contact:text-primary transition-colors font-medium">
              {socials.facebook.replace('facebook.com/', '')}
            </span>
          </a>

        </div>
      </div>

    </aside>
  )
}
