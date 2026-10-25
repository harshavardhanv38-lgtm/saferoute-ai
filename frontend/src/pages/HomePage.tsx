import { Link } from 'react-router-dom'
import { Shield, GitCompare, FlaskConical, MapPin, ChevronRight, AlertTriangle, Lightbulb, Users, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: GitCompare,
    title: 'Route Infrastructure Comparison',
    desc: 'Compare two walking routes side-by-side using five observable infrastructure features. See a weighted score and feature charts.',
    color: 'teal',
    link: '/compare',
    linkLabel: 'Compare Routes',
  },
  {
    icon: FlaskConical,
    title: 'Machine Learning Research',
    desc: 'Train real Decision Tree and Random Forest classifiers on a synthetic dataset and view genuine model performance metrics.',
    color: 'purple',
    link: '/ml-research',
    linkLabel: 'Open ML Lab',
  },
  {
    icon: BarChart3,
    title: 'Research Methodology',
    desc: 'Read the full research methodology, ethical considerations, limitations, and future directions for this science project.',
    color: 'blue',
    link: '/research',
    linkLabel: 'Read Research',
  },
]

const stats = [
  { value: '5', label: 'Infrastructure Features' },
  { value: '2', label: 'ML Models Compared' },
  { value: '120', label: 'Synthetic Data Points' },
  { value: '100%', label: 'Open & Transparent' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(20,184,166,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-teal-300 text-sm font-medium">School ML Research Project · Science Exhibition 2024</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up delay-100">
              Better route{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf, #60a5fa)' }}>
                information.
              </span>
              <br />More informed journeys.
            </h1>

            <p className="text-navy-200 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl animate-fade-in-up delay-200">
              SafeRoute AI is a machine learning research project that compares walking route infrastructure
              — including street lighting, footpath quality, and access to public facilities — to help
              understand which routes have better observable infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <Link to="/compare" id="hero-compare-btn" className="btn-primary inline-flex items-center gap-2 text-base">
                <GitCompare className="w-5 h-5" />
                Compare Routes
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/research" className="btn-secondary inline-flex items-center gap-2 text-base">
                Read the Research
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 flex items-start gap-3 disclaimer-banner animate-fade-in-up delay-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                <strong>Research prototype only.</strong> This application uses fictional route names and synthetic data.
                It does not predict crime, guarantee personal safety, or use real street data.
                All infrastructure scores are demonstration values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-navy-800 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-teal-400 mb-1">{value}</div>
                <div className="text-navy-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="section-title">How SafeRoute AI Works</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The system compares observable infrastructure features using a transparent weighted formula
            and machine learning classifiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Enter Route Features', desc: 'Use sliders to set infrastructure scores (0–100) for two routes: lighting, footpath quality, facilities, transport, and help points.' },
            { step: '02', title: 'See the Comparison', desc: 'View a weighted Infrastructure Indicator score, bar chart comparison, and radar chart for each route.' },
            { step: '03', title: 'Understand the Limits', desc: 'Read plain-language explanations of what the score means — and importantly, what it cannot tell you about personal safety.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card-hover">
              <div className="text-5xl font-black text-teal-500/20 mb-3">{step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-navy-300 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-navy-900/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Explore the Application</h2>
            <p className="section-subtitle max-w-xl mx-auto">Each section of the application serves a different research purpose.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, link, linkLabel }) => (
              <div key={title} className="card flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                  color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-navy-300 text-sm leading-relaxed flex-1 mb-4">{desc}</p>
                <Link to={link} className="text-teal-400 hover:text-teal-300 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                  {linkLabel} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title mb-4">Five Observable Infrastructure Features</h2>
            <p className="section-subtitle mb-6">
              Each feature is scored from 0 to 100. These are the only inputs the model uses — no location data,
              no personal information, no crime statistics.
            </p>
            <ul className="space-y-3">
              {[
                { name: 'Street Lighting', weight: 35, desc: 'Presence and quality of lighting along the route' },
                { name: 'Footpath Quality', weight: 25, desc: 'Condition, width, and continuity of footpaths' },
                { name: 'Public Facility Access', weight: 15, desc: 'Proximity to shops, cafes, or public buildings' },
                { name: 'Public Transport Access', weight: 15, desc: 'Distance to bus stops, train stations, or shelters' },
                { name: 'Public Help Points', weight: 10, desc: 'Emergency phones, call boxes, or CCTV presence' },
              ].map(({ name, weight, desc }) => (
                <li key={name} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                      <span className="text-teal-400 text-xs font-bold">{weight}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{name}</div>
                    <div className="text-navy-400 text-xs mt-0.5">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">Research Context</h3>
            </div>
            <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
              <p>
                Research in urban planning and criminology has explored how the built environment
                — lighting, visibility, and access to help — may affect how safe people feel in public spaces.
              </p>
              <p>
                This project applies machine learning to classify walking route infrastructure quality
                from observable features. It is a <em>prototype</em> built for a school science exhibition.
              </p>
              <p>
                <strong className="text-white">What this is:</strong> A transparent, explainable comparison
                of infrastructure features.
              </p>
              <p>
                <strong className="text-white">What this is not:</strong> A real-time safety system,
                a crime prediction tool, or a personal safety guarantee.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-navy-700">
              <div className="flex items-center gap-2 text-navy-400 text-xs">
                <Users className="w-4 h-4" />
                Safer public spaces require infrastructure investment and community action — not tools
                that place the burden on individuals.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900/60 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore?</h2>
          <p className="text-navy-300 mb-8">Start with the interactive route comparison or dive into the ML research lab.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/compare" id="bottom-compare-btn" className="btn-primary inline-flex items-center gap-2">
              <GitCompare className="w-5 h-5" /> Compare Routes
            </Link>
            <Link to="/ml-research" className="btn-outline inline-flex items-center gap-2">
              <FlaskConical className="w-5 h-5" /> ML Research Lab
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
