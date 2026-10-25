import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/',            label: 'Home' },
  { to: '/compare',    label: 'Compare Routes' },
  { to: '/ml-research',label: 'ML Research' },
  { to: '/research',   label: 'Research' },
  { to: '/about',      label: 'About' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-navy-800 bg-navy-950/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-tight">SafeRoute</span>
              <span className="text-teal-400 font-bold text-lg leading-tight"> AI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg text-navy-300 hover:text-white hover:bg-navy-800 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-navy-800 bg-navy-950/95 backdrop-blur-lg px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'text-navy-300 hover:text-white hover:bg-navy-800'
                }`
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
