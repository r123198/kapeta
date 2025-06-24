import { Star, Sparkles, Gift } from 'lucide-react'

export default function FeaturedCards() {
  return (
    <div className="space-y-6">
      {/* Top Rated Cafe */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
        <div className="bg-accent/10 rounded-full p-2">
          <Star className="w-6 h-6 text-accent" />
        </div>
        <div>
          <div className="font-semibold text-foreground">Top Rated</div>
          <div className="text-sm text-muted">Kape Alley (4.8/5)</div>
        </div>
      </div>
      {/* New Cafe */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-2">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="font-semibold text-foreground">New Cafe</div>
          <div className="text-sm text-muted">Mahayahay Brew just opened!</div>
        </div>
      </div>
      {/* Promo */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
        <div className="bg-warning/10 rounded-full p-2">
          <Gift className="w-6 h-6 text-warning" />
        </div>
        <div>
          <div className="font-semibold text-foreground">Promo</div>
          <div className="text-sm text-muted">Free 2nd cup at Brew & Grind Co</div>
        </div>
      </div>
    </div>
  )
} 