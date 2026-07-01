import { MapPin, Clock, Star, Users } from 'lucide-react'
import { FEATURES_DATA } from '@/lib/constants'

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">ROOT</span>?
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            We're not just another coffee directory. We're your local coffee community.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES_DATA.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-secondary/30 rounded-2xl border border-secondary hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {feature.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="flex items-center gap-2 text-sm text-muted">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted mb-6">
            Ready to discover Iligan's coffee scene like never before?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="w-4 h-4 text-accent" />
              <span>20+ cafes mapped</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock className="w-4 h-4 text-primary" />
              <span>Real-time updates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Users className="w-4 h-4 text-accent" />
              <span>Growing community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 