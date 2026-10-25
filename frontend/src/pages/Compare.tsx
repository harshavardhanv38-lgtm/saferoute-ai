import { useState, useMemo } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Info, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface RouteFeatures {
  street_lighting: number
  footpath_quality: number
  public_facility_access: number
  public_transport_access: number
  public_help_points: number
}

interface Route {
  name: string
  color: string
  features: RouteFeatures
}

// ── Constants ──────────────────────────────────────────────────────────────────
const FEATURE_LABELS: Record<keyof RouteFeatures, string> = {
  street_lighting: 'Street Lighting',
  footpath_quality: 'Footpath Quality',
  public_facility_access: 'Public Facility Access',
  public_transport_access: 'Public Transport',
  public_help_points: 'Help Points',
}

const WEIGHTS: Record<keyof RouteFeatures, number> = {
  street_lighting: 0.35,
  footpath_quality: 0.25,
  public_facility_access: 0.15,
  public_transport_access: 0.15,
  public_help_points: 0.10,
}

const WEIGHT_LABELS: Record<keyof RouteFeatures, string> = {
  street_lighting: '35%',
  footpath_quality: '25%',
  public_facility_access: '15%',
  public_transport_access: '15%',
  public_help_points: '10%',
}

const DEFAULT_ROUTE_A: Route = {
  name: 'Route A — Main Street',
  color: '#14b8a6',
  features: {
    street_lighting: 70,
    footpath_quality: 80,
    public_facility_access: 60,
    public_transport_access: 75,
    public_help_points: 65,
  },
}

const DEFAULT_ROUTE_B: Route = {
  name: 'Route B — Residential Street',
  color: '#38bdf8',
  features: {
    street_lighting: 40,
    footpath_quality: 65,
    public_facility_access: 85,
    public_transport_access: 60,
    public_help_points: 80,
  },
}

// ── Formula ────────────────────────────────────────────────────────────────────
function calcScore(f: RouteFeatures): number {
  return Object.keys(WEIGHTS).reduce((sum, key) => {
    const k = key as keyof RouteFeatures
    return sum + f[k] * WEIGHTS[k]
  }, 0)
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FeatureSlider({
  label, weightLabel, value, color,
  onChange,
}: { label: string; weightLabel: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
          {label} <span style={{ color: '#475569', fontWeight: 400 }}>({weightLabel})</span>
        </label>
        <div style={{
          minWidth: 44, textAlign: 'center',
          background: 'var(--navy-950)', border: `1px solid ${color}40`,
          borderRadius: 6, padding: '0.15rem 0.5rem',
          fontWeight: 700, fontSize: '0.9rem', color,
        }}>
          {value}
        </div>
      </div>
      <input
        type="range"
        min={0} max={100} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ accentColor: color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem' }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  )
}

function ScoreCircle({ score, color, label }: { score: number; color: string; label: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', width: 130, height: 130 }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
          <circle
            cx={65} cy={65} r={r} fill="none"
            stroke={color} strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{score.toFixed(1)}</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>/ 100</span>
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.5rem' }}>{label}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 68) return <span className="badge" style={{ background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)' }}>Better Infrastructure</span>
  if (score >= 45) return <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>Moderate Infrastructure</span>
  return <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Needs Improvement</span>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem' }}>
        <p style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    )
  }
  return null
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Compare() {
  const [routeA, setRouteA] = useState<Route>(DEFAULT_ROUTE_A)
  const [routeB, setRouteB] = useState<Route>(DEFAULT_ROUTE_B)

  const scoreA = useMemo(() => calcScore(routeA.features), [routeA])
  const scoreB = useMemo(() => calcScore(routeB.features), [routeB])

  const updateFeatureA = (key: keyof RouteFeatures, v: number) =>
    setRouteA(r => ({ ...r, features: { ...r.features, [key]: v } }))
  const updateFeatureB = (key: keyof RouteFeatures, v: number) =>
    setRouteB(r => ({ ...r, features: { ...r.features, [key]: v } }))

  // Radar data
  const radarData = Object.keys(FEATURE_LABELS).map(k => {
    const key = k as keyof RouteFeatures
    return {
      subject: FEATURE_LABELS[key].replace(' Access', '').replace('Public ', ''),
      A: routeA.features[key],
      B: routeB.features[key],
    }
  })

  // Bar data
  const barData = Object.keys(FEATURE_LABELS).map(k => {
    const key = k as keyof RouteFeatures
    return {
      name: FEATURE_LABELS[key].replace(' Access', '').replace('Public ', ''),
      'Route A': routeA.features[key],
      'Route B': routeB.features[key],
    }
  })

  const diff = scoreA - scoreB
  const leader = diff > 0.5 ? routeA.name : diff < -0.5 ? routeB.name : null

  const explanation = useMemo(() => {
    const highA: string[] = []
    const highB: string[] = []
    Object.keys(FEATURE_LABELS).forEach(k => {
      const key = k as keyof RouteFeatures
      const diff = routeA.features[key] - routeB.features[key]
      if (diff > 10) highA.push(FEATURE_LABELS[key])
      else if (diff < -10) highB.push(FEATURE_LABELS[key])
    })
    return { highA, highB }
  }, [routeA, routeB])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-label">Route Comparison</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Compare Walking Routes
        </h1>
        <p style={{ color: '#64748b', maxWidth: 600 }}>
          Adjust the sliders for each route. The infrastructure indicator updates live using the weighted formula below.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.855rem', color: '#fbbf24',
      }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Rule-Based Infrastructure Indicator — Not a Safety Score</strong>
          <p style={{ color: '#a16207', marginTop: '0.2rem' }}>
            This comparison uses a weighted formula on demonstration values. It does not predict crime, guarantee
            personal safety, or reflect real infrastructure measurements.
          </p>
        </div>
      </div>

      {/* Route Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Route A */}
        <div className="card" style={{ borderColor: 'rgba(20,184,166,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>{routeA.name}</h2>
              <input
                value={routeA.name}
                onChange={e => setRouteA(r => ({ ...r, name: e.target.value }))}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#64748b', fontSize: '0.78rem', width: '100%', marginTop: '0.15rem', fontFamily: 'Inter, sans-serif' }}
                placeholder="Edit route name..."
              />
            </div>
            <ScoreCircle score={scoreA} color={routeA.color} label="Indicator" />
          </div>
          {Object.keys(FEATURE_LABELS).map(k => {
            const key = k as keyof RouteFeatures
            return (
              <FeatureSlider key={key} label={FEATURE_LABELS[key]} weightLabel={WEIGHT_LABELS[key]}
                value={routeA.features[key]} color={routeA.color}
                onChange={v => updateFeatureA(key, v)} />
            )
          })}
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ScoreBadge score={scoreA} />
            <button onClick={() => setRouteA(DEFAULT_ROUTE_A)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset</button>
          </div>
        </div>

        {/* Route B */}
        <div className="card" style={{ borderColor: 'rgba(56,189,248,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>{routeB.name}</h2>
              <input
                value={routeB.name}
                onChange={e => setRouteB(r => ({ ...r, name: e.target.value }))}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#64748b', fontSize: '0.78rem', width: '100%', marginTop: '0.15rem', fontFamily: 'Inter, sans-serif' }}
                placeholder="Edit route name..."
              />
            </div>
            <ScoreCircle score={scoreB} color={routeB.color} label="Indicator" />
          </div>
          {Object.keys(FEATURE_LABELS).map(k => {
            const key = k as keyof RouteFeatures
            return (
              <FeatureSlider key={key} label={FEATURE_LABELS[key]} weightLabel={WEIGHT_LABELS[key]}
                value={routeB.features[key]} color={routeB.color}
                onChange={v => updateFeatureB(key, v)} />
            )
          })}
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ScoreBadge score={scoreB} />
            <button onClick={() => setRouteB(DEFAULT_ROUTE_B)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset</button>
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(20,184,166,0.2)', background: 'linear-gradient(135deg, rgba(20,184,166,0.04), rgba(56,189,248,0.04))' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Comparison Result</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {diff > 0.5 ? <TrendingUp size={18} color="#14b8a6" /> : diff < -0.5 ? <TrendingDown size={18} color="#38bdf8" /> : <Minus size={18} color="#64748b" />}
              <h3 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.1rem' }}>
                {Math.abs(diff) <= 0.5
                  ? 'Routes have nearly identical infrastructure scores'
                  : `${leader} has a higher infrastructure indicator (+${Math.abs(diff).toFixed(1)} pts)`}
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '1.8rem', color: '#14b8a6', lineHeight: 1 }}>{scoreA.toFixed(1)}</p>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Route A</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '1.8rem', color: '#38bdf8', lineHeight: 1 }}>{scoreB.toFixed(1)}</p>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Route B</p>
            </div>
          </div>
        </div>

        {/* Plain language explanation */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <Info size={14} color="#14b8a6" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.65 }}>
              {explanation.highA.length > 0 && (
                <><strong style={{ color: '#14b8a6' }}>Route A</strong> scores higher on: {explanation.highA.join(', ')}. </>
              )}
              {explanation.highB.length > 0 && (
                <><strong style={{ color: '#38bdf8' }}>Route B</strong> scores higher on: {explanation.highB.join(', ')}. </>
              )}
              {explanation.highA.length === 0 && explanation.highB.length === 0 && (
                'Both routes have similar feature values across most categories. '
              )}
              These are infrastructure indicators only — a higher score does not mean a route is safer, and a lower score does not mean it is dangerous.
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Feature-by-Feature Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem', paddingTop: '0.5rem' }} />
              <Bar dataKey="Route A" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Route A" />
              <Bar dataKey="Route B" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Route B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Radar Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Route A" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.18} strokeWidth={2} />
              <Radar name="Route B" dataKey="B" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} strokeWidth={2} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Weight Breakdown — Infrastructure Indicator Formula
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Weight</th>
                <th>Route A Value</th>
                <th>Route A Contribution</th>
                <th>Route B Value</th>
                <th>Route B Contribution</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(FEATURE_LABELS).map(k => {
                const key = k as keyof RouteFeatures
                return (
                  <tr key={key}>
                    <td style={{ color: '#f8fafc', fontWeight: 500 }}>{FEATURE_LABELS[key]}</td>
                    <td><span className="badge badge-teal">{WEIGHT_LABELS[key]}</span></td>
                    <td style={{ color: '#14b8a6' }}>{routeA.features[key]}</td>
                    <td style={{ color: '#14b8a6' }}>{(routeA.features[key] * WEIGHTS[key]).toFixed(1)}</td>
                    <td style={{ color: '#38bdf8' }}>{routeB.features[key]}</td>
                    <td style={{ color: '#38bdf8' }}>{(routeB.features[key] * WEIGHTS[key]).toFixed(1)}</td>
                  </tr>
                )
              })}
              <tr style={{ fontWeight: 700 }}>
                <td style={{ color: '#f8fafc' }}>Total Score</td>
                <td style={{ color: '#f8fafc' }}>100%</td>
                <td></td>
                <td style={{ color: '#14b8a6', fontSize: '1rem' }}>{scoreA.toFixed(2)}</td>
                <td></td>
                <td style={{ color: '#38bdf8', fontSize: '1rem' }}>{scoreB.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
