import Link from 'next/link'
import { FOOTER_LINKS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-surface text-on-surface border-t border-border-subtle flex flex-col md:flex-row justify-between items-center w-full px-grid-margin py-stack-md gap-stack-md mt-auto pb-20 md:pb-stack-md">
      <div className="font-hanken text-title-md font-bold text-primary tracking-tight">
        ROOT
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {FOOTER_LINKS.map((link, index) => (
          <Link 
            key={index}
            href={link.href} 
            className="font-mono text-label-caps text-secondary hover:text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="font-sans text-body-sm text-secondary">
        © {new Date().getFullYear()} ROOT. ALL RIGHTS RESERVED.
      </div>
    </footer>
  )
}