import { Link } from 'react-router-dom'
import { ArrowRight, Shield, BarChart3, Brain, BookOpen, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'

const features = [
  {
    icon: <BarChart3 size={22} color="#14b8a6" />,
    title: 'Infrastructure Comparison',
    desc: 'Compare routes across 5 key infrastructure features using a transparent, weighted formula.',
  },
  {
    icon: <Brain size={22} color="#38bdf8" />,
    title: 'ML Research Pipeline',
    desc: 'Train and evaluate Decision Tree and Random Forest classifiers with real scikit-learn metrics.',
  },
  {
    icon: <MapPin size={22} color="#a78bfa" />,
    title: 'Route Visualisation',
    desc: 'View example walking routes with infrastructure observations on an interactive map.',
  },
  {
    icon: <BookOpen size={22} color="#fb923c" />,
    title: 'Research Methodology',
    desc: 'Structured research documentation covering hypothesis, dataset, model selection, and limitations.',
  },
]

const featureWeights = [
  { label: 'Street Lighting', weight: '35%', color: '#14b8a6' },
  { label: 'Footpath Quality', weight: '25%', color: '#38bdf8' },
  { label: 'Public Facility Access', weight: '15%', color: '#a78bfa' },
  { label: 'Public Transport', weight: '15%', color: '#fb923c' },
  { label: 'Help Points', weight: '10%', color: '#f472b6' },
]

export default function Home() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 70%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }} className="animate-fade-in-up">
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span className="badge badge-teal">
              <Shield size={12} />
              School ML Research Project · Science Exhibition 2026
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#f8fafc',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}>
            Better route information.{' '}
            <span style={{ color: '#14b8a6' }}>More informed journeys.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 580, margin: '0 auto 2rem' }}>
            SafeRoute AI compares walking-route infrastructure — street lighting, footpath quality, public transport,
            and help points — using a transparent formula and machine-learning research. It does not predict crime
            or guarantee personal safety.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/compare" className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
              Compare Routes <ArrowRight size={18} />
            </Link>
            <Link to="/research" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
              ML Research Lab
            </Link>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#fbbf24', maxWidth: 520,
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>
                Prototype using <strong>synthetic data</strong>. Infrastructure comparison only — not a personal safety guarantee.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--navy-900)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">How it works</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Transparent infrastructure analysis
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 520, margin: '0 auto' }}>
              Every score is calculated with a visible formula. No black boxes — just clear, explainable comparisons.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formula Section ───────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">Infrastructure Formula</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Rule-based weighted indicator
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto' }}>
              A weighted sum calculates the infrastructure indicator score (0–100) for each route.
              This is <em>not</em> a machine-learning prediction.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ fontFamily: 'monospace', background: 'var(--navy-950)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#2dd4bf', lineHeight: 2 }}>
              Score = (Street Lighting × <strong>0.35</strong>) +<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Footpath Quality × <strong>0.25</strong>) +<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Public Facility × <strong>0.15</strong>) +<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Public Transport × <strong>0.15</strong>) +<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Help Points × <strong>0.10</strong>)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {featureWeights.map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--navy-950)', borderRadius: 8, padding: '0.4rem 0.85rem',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{f.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: f.color }}>{f.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ethics Banner ─────────────────────────────────────── */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--navy-900)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="card" style={{
            border: '1px solid rgba(20,184,166,0.25)',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.05), rgba(56,189,248,0.05))',
          }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#f8fafc', marginBottom: '1rem' }}>
              Our Approach & Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                'Infrastructure data only — no crime prediction',
                'All data is clearly labelled as synthetic',
                'No personal safety guarantees',
                'Safer spaces require community action, not apps',
                'Privacy and consent respected',
                'Transparent formula — no hidden scores',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  <CheckCircle2 size={15} color="#14b8a6" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
            Ready to compare routes?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Adjust the infrastructure sliders and see the weighted indicator score update in real time.
          </p>
          <Link to="/compare" className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem' }}>
            Open Route Comparison <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
