import { X, Check, Frown, Smile, Wifi, Coffee, Users } from 'lucide-react'

const problems = [
  {
    icon: Frown,
    title: "Wasted Time",
    description: "Arrive at a cafe only to find slow wifi or no outlets"
  },
  {
    icon: Frown,
    title: "Poor Coffee Quality",
    description: "No way to know about bean quality or brewing methods"
  },
  {
    icon: Frown,
    title: "Isolation",
    description: "Working alone without a community of fellow remote workers"
  }
]

const solutions = [
  {
    icon: Wifi,
    title: "Work-Ready Intel",
    description: "Real-time wifi speeds, outlet maps, and noise levels"
  },
  {
    icon: Coffee,
    title: "Coffee Expertise",
    description: "Bean origin, roast notes, and barista recommendations"
  },
  {
    icon: Users,
    title: "Community Access",
    description: "Connect with remote workers and join coffee meetups"
  }
]

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Coffee Shop Struggle is Real
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            We've been there. That's why we built kapeta! to solve the real problems remote workers face.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Problems side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2">
                <X className="w-6 h-6 text-red-500" />
                Current Frustrations
              </h3>
              <p className="text-muted">What remote workers deal with every day</p>
            </div>

            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-white rounded-xl border border-red-100 shadow-sm"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <problem.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {problem.title}
                    </h4>
                    <p className="text-muted text-sm">
                      {problem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2">
                <Check className="w-6 h-6 text-success" />
                Our Solution
              </h3>
              <p className="text-muted">How kapeta! makes coffee shop work better</p>
            </div>

            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-white rounded-xl border border-green-100 shadow-sm"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <solution.icon className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {solution.title}
                    </h4>
                    <p className="text-muted text-sm">
                      {solution.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <Smile className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Ready to Transform Your Coffee Shop Experience?
            </h3>
            <p className="text-muted mb-6">
              Join the waitlist and be among the first to access Iligan's ultimate coffee directory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted">
              <span>✓ No more wasted time</span>
              <span>✓ Better coffee choices</span>
              <span>✓ Community connection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 