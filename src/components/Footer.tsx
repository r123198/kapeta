import { Coffee, Mail, MapPin, Phone, Facebook, Instagram, Twitter } from 'lucide-react'
import EmailForm from './EmailForm'

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold text-primary">kapeta!</h3>
            </div>
            <p className="text-white/80 mb-6 max-w-md">
              "Let's get coffee!" - Your local guide to Iligan's best coffee shops. 
              Discover work-friendly cafes, connect with the community, and enjoy amazing coffee.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-4 h-4" />
                <span>Iligan City, Philippines</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="w-4 h-4" />
                <span>hello@kapeta.ph</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone className="w-4 h-4" />
                <span>+63 912 345 6789</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-white/70 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-white/70 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#about" className="text-white/70 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-white/70 mb-4 text-sm">
              Get notified when we launch and receive exclusive coffee tips!
            </p>
            <EmailForm variant="footer" source="footer" />
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-white/60 text-sm">
              © 2024 kapeta! All rights reserved.
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 