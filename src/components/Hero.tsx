import EmailForm from './EmailForm'
import { Coffee, Heart, MapPin, Users, MessageCircle, Play } from 'lucide-react'

interface HeroProps {
  userCount: number
}

export default function Hero({ userCount }: HeroProps) {
  const displayCount = Math.max(userCount, 50)

  return (
    <section className="relative min-h-screen flex items-center hero-bg">
      {/* Additional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm hero-text">
              <span>🏆</span>
              <span className="font-medium">#1 Coffee Community in Iligan</span>
              <span>⭐⭐⭐⭐⭐</span>
              <span className="text-white/80">SINCE 2024</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 hero-text">
                ROOT and discover coffee together
              </h1>
              <p className="text-xl text-white/90 italic hero-text">
                "Let's get coffee!"
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-white/90 leading-relaxed max-w-lg hero-text">
              Join Iligan's growing community of {displayCount}+ coffee enthusiasts and remote workers 
              discovering the best cafes since 2024. Don't go at it alone - 
              meet fellow coffee lovers and work together!
            </p>

            {/* Member Avatars Row */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white flex items-center justify-center text-white text-sm font-medium hover-lift"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/80 text-sm ml-2 hero-text">
                Join {displayCount}+ coffee lovers
              </span>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90 hero-text">
                <Coffee className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Discover 15+ coffee shops/year in Iligan & nearby cities</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hero-text">
                <Heart className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Meet new people for coffee dates and work sessions</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hero-text">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Research cafes and find your perfect workspace</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hero-text">
                <Users className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Keep track of your coffee journey and favorite spots</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hero-text">
                <MessageCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span>Join ROOT Discord chat and find your coffee community</span>
              </div>
            </div>

            {/* Email Form */}
            <div className="max-w-md">
              <EmailForm variant="hero" source="hero_section" />
              <p className="text-white/70 text-xs mt-2 hero-text">
                If you already have an account, we'll log you in
              </p>
            </div>
          </div>

          {/* Right Column - Hero Image/Video */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10 hover-lift">
              {/* Placeholder for hero image/video */}
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover-lift">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white/80 text-sm">Coffee shop ambiance</p>
                </div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover-lift">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">15+</div>
                  <div className="text-white/70 text-xs">Partner Cafes</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover-lift">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">5+</div>
                  <div className="text-white/70 text-xs">Areas Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 