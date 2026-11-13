'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Map, Compass, Bookmark, User, Award, Megaphone, Newspaper, ShieldAlert } from 'lucide-react'
import { NAVIGATION_LINKS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, role, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Filter links by auth and role permissions
  const filteredLinks = NAVIGATION_LINKS.filter(link => {
    if (link.path === '/directory' || link.path === '/badges') {
      return !!user
    }
    if (link.path === '/studio') {
      return !!user && (role === 'superadmin' || role === 'admin' || role === 'moderator' || role === 'managers')
    }
    if (link.path === '/admin') {
      return !!user && (role === 'superadmin' || role === 'admin')
    }
    return true
  })

  // Links displayed in the top desktop header & mobile menu drawer
  const headerLinks = filteredLinks.filter(link => {
    return link.path !== '/bookmarks'
  })

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
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/" className="font-hanken text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight">
            ROOT
          </Link>
        </div>

        {/* Middle: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {headerLinks.map((link, index) => (
            <Link
              key={index}
              href={link.path}
              className={`font-sans text-xs font-semibold uppercase tracking-wider pb-1 transition-all ${isActive(link.path)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-secondary hover:text-primary'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Desktop Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:block font-mono text-[11px] text-secondary">
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-[11px] uppercase tracking-wider text-secondary hover:text-primary transition-colors border border-border-subtle px-3 py-1.5 hover:border-primary"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              title="Log In"
              aria-label="Log In"
              className="px-3.5 py-1.5 flex items-center gap-1.5 border border-border-subtle text-primary font-mono text-[11px] uppercase tracking-wider hover:bg-surface-alt hover:border-primary transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-canvas-white pt-20 px-grid-margin border-b border-border-subtle animate-fade-in-up">
          <nav className="flex flex-col gap-6 text-center">
            {headerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-mono text-headline-lg-mobile py-2 ${isActive(link.path) ? 'text-primary font-bold border-b border-primary' : 'text-secondary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <hr className="border-border-subtle my-2" />
                <div className="flex flex-col gap-4 items-center">
                  <span className="font-mono text-[11px] uppercase text-secondary">
                    {user.email} ({role})
                  </span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="font-mono text-label-caps text-secondary py-2 border border-border-subtle w-full max-w-[200px]"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent for quick context switching on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-canvas-white border-t border-border-subtle flex justify-around py-2.5 z-50 md:hidden">
        {filteredLinks.slice(0, 4).map((link, index) => {
          const IconComponent =
            link.path === '/'
              ? Map
              : link.path === '/directory'
              ? Compass
              : link.path === '/news'
              ? Newspaper
              : link.path === '/badges'
              ? Award
              : link.path === '/studio'
              ? Megaphone
              : link.path === '/admin'
              ? ShieldAlert
              : Bookmark
          const labelName = link.path === '/directory' ? 'Directory' : link.label
          return (
            <Link
              key={index}
              href={link.path}
              className={`flex flex-col items-center px-2 py-0.5 ${isActive(link.path) ? 'text-primary font-semibold' : 'text-secondary'}`}
            >
              <IconComponent className={`w-5 h-5 ${isActive(link.path) ? 'stroke-[2.25px]' : ''}`} />
              <span className="font-sans text-[10px] tracking-wide mt-1">{labelName}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
