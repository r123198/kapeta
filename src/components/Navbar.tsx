'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { NAVIGATION_LINKS } from '@/lib/constants'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-canvas-white text-on-surface border-b border-border-subtle flex justify-between items-center w-full px-grid-margin py-stack-sm max-w-full sticky top-0 z-50 shrink-0">
        {/* Left: Brand & Search Toggle */}
        <div className="flex items-center gap-6">
          <button 
            className="md:hidden flex items-center justify-center p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          <Link href="/" className="font-hanken text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight">
            ROOT
          </Link>
          <span className="font-mono text-label-caps text-secondary mt-1 hidden md:block">
            Curated Directory
          </span>
        </div>

        {/* Middle: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAVIGATION_LINKS.map((link, index) => (
            <Link 
              key={index}
              href={link.path} 
              className={`font-mono text-label-caps pb-1 transition-all ${
                isActive(link.path) 
                  ? 'text-primary font-bold border-b-2 border-primary' 
                  : 'text-secondary font-medium hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Desktop Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block font-mono text-label-caps text-secondary hover:text-primary transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="font-mono text-label-caps bg-primary text-on-primary px-4 py-2 hover:bg-tertiary-container transition-colors">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-canvas-white pt-20 px-grid-margin border-b border-border-subtle animate-fade-in-up">
          <nav className="flex flex-col gap-6 text-center">
            {NAVIGATION_LINKS.map((link, index) => (
              <Link 
                key={index}
                href={link.path} 
                onClick={() => setMobileMenuOpen(false)}
                className={`font-mono text-headline-lg-mobile py-2 ${
                  isActive(link.path) ? 'text-primary font-bold border-b border-primary' : 'text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border-subtle my-2" />
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-label-caps text-secondary py-2"
            >
              Log In
            </Link>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent for quick context switching on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-canvas-white border-t border-border-subtle flex justify-around py-3 z-50 md:hidden">
        {NAVIGATION_LINKS.filter(link => link.path !== '/admin').map((link, index) => {
          const iconName = link.path === '/' ? 'explore' : link.path === '/map' ? 'map' : 'bookmarks'
          const labelName = link.path === '/' ? 'Discovery' : link.label
          return (
            <Link 
              key={index}
              href={link.path} 
              className={`flex flex-col items-center ${isActive(link.path) ? 'text-primary' : 'text-secondary'}`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive(link.path) ? 'material-symbols-fill' : ''}`}>
                {iconName}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider mt-1">{labelName}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
