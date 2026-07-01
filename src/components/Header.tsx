'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { HEADER_LINKS } from '@/lib/constants'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="ROOT - Let's get coffee!"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {HEADER_LINKS.map((link, index) => (
              <a key={index} href={link.href} className="text-white hover:text-secondary transition-colors">
                {link.label}
              </a>
            ))}
            <a 
              href="#join" 
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Join ROOT! →
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-sm rounded-lg mt-2 p-4">
            <nav className="flex flex-col gap-4">
              {HEADER_LINKS.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="text-white hover:text-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a 
                href="#join" 
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Join ROOT! →
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 