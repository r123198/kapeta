import { Check, Star, Coffee, Users, MapPin } from 'lucide-react'

const features = [
  "Access to complete coffee shop directory",
  "Real-time wifi speed & outlet information",
  "Detailed coffee bean & roast information",
  "Community meetups & networking events",
  "Exclusive member-only discounts",
  "Early access to new cafe listings",
  "Mobile app access (coming soon)",
  "Priority customer support"
]

const freeFeatures = [
  "Basic coffee shop listings",
  "Limited wifi information",
  "Community forum access"
]

export default function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Start exploring for free, upgrade when you're ready for the full experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-secondary/30 rounded-2xl p-8 border border-secondary">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free Directory</h3>
              <div className="text-4xl font-bold text-primary mb-2">₱0</div>
              <p className="text-muted">Perfect for casual coffee lovers</p>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-muted">
                  <Check className="w-4 h-4 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-3 px-6 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors duration-200">
              Get Started Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 border border-primary relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Most Popular
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Premium Community</h3>
              <div className="text-4xl font-bold text-white mb-2">₱250</div>
              <p className="text-white/80">per month</p>
              <p className="text-white/60 text-sm mt-2">For serious coffee enthusiasts & remote workers</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-white/90">
                  <Check className="w-4 h-4 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-3 px-6 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors duration-200">
              Join Early Access
            </button>
          </div>
        </div>

        {/* Value proposition */}
        <div className="text-center mt-16">
          <div className="bg-secondary/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Why Premium is Worth It
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Better Coffee</h4>
                  <p className="text-sm text-muted">Know exactly what you're drinking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Save Time</h4>
                  <p className="text-sm text-muted">No more wasted trips to cafes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Build Community</h4>
                  <p className="text-sm text-muted">Connect with fellow coffee lovers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="text-center mt-12">
          <p className="text-muted text-sm">
            💯 30-day money-back guarantee • Cancel anytime • No long-term commitment
          </p>
        </div>
      </div>
    </section>
  )
} 