import { Link } from 'react-router-dom'
import { Shield, Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="text-white font-bold">SafeRoute AI</span>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed">
              A school-level machine learning research project comparing walking route infrastructure.
              Not intended as a personal safety guarantee.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Pages</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/compare', label: 'Compare Routes' },
                { to: '/ml-research', label: 'ML Research Lab' },
                { to: '/research', label: 'Research Methodology' },
                { to: '/about', label: 'About & Limitations' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-navy-400 hover:text-teal-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Important Notice</h4>
            <p className="text-navy-400 text-sm leading-relaxed mb-2">
              All data in this application is <strong className="text-amber-300">synthetic and fictional</strong>, used
              for research demonstration only.
            </p>
            <p className="text-navy-400 text-sm leading-relaxed">
              This tool does not predict crime or guarantee personal safety.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="badge-amber">⚠ Research Prototype</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-navy-500 text-xs">
          <span>© 2024 SafeRoute AI Research Project. School Science Exhibition Prototype.</span>
          <span>Built with React + FastAPI + scikit-learn</span>
        </div>
      </div>
    </footer>
  )
}
