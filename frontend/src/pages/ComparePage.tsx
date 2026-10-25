import { useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RouteFeatures {
  streetLighting: number
  footpathQuality: number
  publicFacilityAccess: number
  publicTransportAccess: number
  publicHelpPoints: number
}

const WEIGHTS = {
  streetLighting: 0.35,
  footpathQuality: 0.25,
  publicFacilityAccess: 0.15,
  publicTransportAccess: 0.15,
  publicHelpPoints: 0.10,
}

const FEATURE_LABELS: Record<keyof RouteFeatures, string> = {
  streetLighting: 'Street Lighting',
  footpathQuality: 'Footpath Quality',
  publicFacilityAccess: 'Public Facility Access',
  publicTransportAccess: 'Public Transport Access',
  publicHelpPoints: 'Public Help Points',
}

const FEATURE_DESCRIPTIONS: Record<keyof RouteFeatures, string> = {
  streetLighting: 'Quality and coverage of street lighting along the route (weight: 35%)',
  footpathQuality: 'Condition, width, and continuity of footpaths (weight: 25%)',
  publicFacilityAccess: 'Proximity to shops, cafes, or public buildings (weight: 15%)',
  publicTransportAccess: 'Distance to bus stops, train stations (weight: 15%)',
  publicHelpPoints: 'Emergency phones, call boxes, or CCTV presence (weight: 10%)',
}

const DEFAULT_A: RouteFeatures = {
  streetLighting: 70,
  footpathQuality: 80,
  publicFacilityAccess: 60,
  publicTransportAccess: 75,
  publicHelpPoints: 65,
}

const DEFAULT_B: RouteFeatures = {
  streetLighting: 40,
  footpathQuality: 65,
  publicFacilityAccess: 85,
  publicTransportAccess: 60,
  publicHelpPoints: 80,
}

function calcScore(f: RouteFeatures): number {
  return Math.round(
    f.streetLighting * WEIGHTS.streetLighting +
    f.footpathQuality * WEIGHTS.footpathQuality +
    f.publicFacilityAccess * WEIGHTS.publicFacilityAccess +
    f.publicTransportAccess * WEIGHTS.publicTransportAccess +
    f.publicHelpPoints * WEIGHTS.publicHelpPoints
  )
}

function getLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Better Infrastructure', color: 'text-teal-400' }
  if (score >= 50) return { label: 'Moderate Infrastructure', color: 'text-amber-400' }
  return { label: 'Needs Improvement', color: 'text-red-400' }
}

interface SliderRowProps {
  featureKey: keyof RouteFeatures
  value: number
  onChange: (v: number) => void
  routeColor: string
}

function SliderRow({ featureKey, value, onChange, routeColor }: SliderRowProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-white" title={FEATURE_DESCRIPTIONS[featureKey]}>
          {FEATURE_LABELS[featureKey]}
        </label>
        <span className={`text-sm font-bold ${routeColor}`}>{value}</span>
      </div>
      <div className="text-navy-400 text-xs mb-2">{FEATURE_DESCRIPTIONS[featureKey]}</div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1"
          style={{ '--value': `${value}%` } as React.CSSProperties}
          aria-label={FEATURE_LABELS[featureKey]}
        />
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={e => {
            const v = Math.max(0, Math.min(100, Number(e.target.value)))
            onChange(v)
          }}
          className="w-16 bg-navy-800 border border-navy-600 rounded-lg px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-teal-500"
        />
      </div>
    </div>
  )
}

interface ScoreCircleProps {
  score: number
  label: string
  color: string
}

function ScoreCircle({ score, label, color }: ScoreCircleProps) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { label: infraLabel, color: labelColor } = getLabel(score)

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="mb-3">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e3668" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color === 'teal' ? '#14b8a6' : '#818cf8'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="60" y="55" textAnchor="middle" className="text-white" fill="white" fontSize="22" fontWeight="700">{score}</text>
        <text x="60" y="72" textAnchor="middle" fill="#7890b4" fontSize="11">/100</text>
      </svg>
      <div className="text-white font-semibold text-sm mb-0.5">{label}</div>
      <div className={`text-xs font-medium ${labelColor}`}>{infraLabel}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ComparePage() {
  const [routeA, setRouteA] = useState<RouteFeatures>(DEFAULT_A)
  const [routeB, setRouteB] = useState<RouteFeatures>(DEFAULT_B)
  const [nameA, setNameA] = useState('Main Street')
  const [nameB, setNameB] = useState('Residential Street')

  const scoreA = calcScore(routeA)
  const scoreB = calcScore(routeB)

  const updateA = useCallback((key: keyof RouteFeatures) => (v: number) =>
    setRouteA(prev => ({ ...prev, [key]: v })), [])
  const updateB = useCallback((key: keyof RouteFeatures) => (v: number) =>
    setRouteB(prev => ({ ...prev, [key]: v })), [])

  const barData = (Object.keys(FEATURE_LABELS) as (keyof RouteFeatures)[]).map(key => ({
    feature: FEATURE_LABELS[key].replace(' Access', '').replace('Public ', 'Pub. '),
    [nameA]: routeA[key],
    [nameB]: routeB[key],
  }))

  const radarData = (Object.keys(FEATURE_LABELS) as (keyof RouteFeatures)[]).map(key => ({
    subject: FEATURE_LABELS[key].replace(' Access', '').replace('Public ', 'Pub. '),
    [nameA]: routeA[key],
    [nameB]: routeB[key],
    fullMark: 100,
  }))

  const diff = scoreA - scoreB
  const leader = diff > 0 ? nameA : diff < 0 ? nameB : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="section-title">Route Infrastructure Comparison</h1>
        <p className="section-subtitle">Adjust the sliders to set feature values and compare two walking routes.</p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner mb-8 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs leading-relaxed">
          <strong>Research tool only.</strong> The routes below use fictional names and demonstration values.
          A higher infrastructure indicator does <em>not</em> mean a route is safe or that a crime is less likely.
          This score reflects observable infrastructure features only and is not scientifically validated for personal safety assessment.
        </div>
      </div>

      {/* Formula */}
      <div className="info-banner mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong className="text-teal-300">Rule-based Infrastructure Indicator Formula:</strong><br />
            Score = (Street Lighting × 0.35) + (Footpath Quality × 0.25) + (Facility Access × 0.15) + (Transport Access × 0.15) + (Help Points × 0.10)
          </div>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card text-center">
          <ScoreCircle score={scoreA} label={nameA} color="teal" />
        </div>
        <div className="card flex flex-col items-center justify-center">
          <div className="text-navy-400 text-xs uppercase tracking-widest mb-2">Difference</div>
          <div className={`text-4xl font-black mb-1 ${
            diff > 0 ? 'text-teal-400' : diff < 0 ? 'text-indigo-400' : 'text-navy-300'
          }`}>
            {diff > 0 ? '+' : ''}{diff}
          </div>
          {leader ? (
            <div className="flex items-center gap-1 text-sm">
              {diff > 0 ? <TrendingUp className="w-4 h-4 text-teal-400" /> : <TrendingDown className="w-4 h-4 text-indigo-400" />}
              <span className="text-white">{leader}</span>
              <span className="text-navy-400">scores higher</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-navy-400">
              <Minus className="w-4 h-4" /> Equal scores
            </div>
          )}
        </div>
        <div className="card text-center">
          <ScoreCircle score={scoreB} label={nameB} color="indigo" />
        </div>
      </div>

      {/* Route panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Route A */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse-glow" />
            <input
              className="bg-transparent border-0 text-white font-bold text-lg focus:outline-none focus:border-b focus:border-teal-500 w-full"
              value={nameA}
              onChange={e => setNameA(e.target.value)}
              aria-label="Route A name"
            />
            <span className="badge-teal">Route A</span>
          </div>
          {(Object.keys(routeA) as (keyof RouteFeatures)[]).map(key => (
            <SliderRow key={key} featureKey={key} value={routeA[key]} onChange={updateA(key)} routeColor="text-teal-400" />
          ))}
        </div>

        {/* Route B */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full bg-indigo-400" />
            <input
              className="bg-transparent border-0 text-white font-bold text-lg focus:outline-none focus:border-b focus:border-indigo-500 w-full"
              value={nameB}
              onChange={e => setNameB(e.target.value)}
              aria-label="Route B name"
            />
            <span className="badge-blue">Route B</span>
          </div>
          {(Object.keys(routeB) as (keyof RouteFeatures)[]).map(key => (
            <SliderRow key={key} featureKey={key} value={routeB[key]} onChange={updateB(key)} routeColor="text-indigo-400" />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Bar chart */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Feature-by-Feature Comparison</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3668" />
              <XAxis dataKey="feature" tick={{ fill: '#7890b4', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#7890b4', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#7890b4', fontSize: 12 }} />
              <Bar dataKey={nameA} fill="#14b8a6" radius={[4,4,0,0]} />
              <Bar dataKey={nameB} fill="#818cf8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Infrastructure Profile Radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e3668" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#7890b4', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#7890b4', fontSize: 9 }} />
              <Radar name={nameA} dataKey={nameA} stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} />
              <Radar name={nameB} dataKey={nameB} stroke="#818cf8" fill="#818cf8" fillOpacity={0.20} />
              <Legend wrapperStyle={{ color: '#7890b4', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plain language explanation */}
      <div className="card mb-6">
        <h2 className="text-white font-semibold mb-3">Understanding These Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-navy-300 leading-relaxed">
          <div>
            <h3 className="text-teal-400 font-medium mb-1">{nameA} (Score: {scoreA}/100)</h3>
            <p>This route scores higher on street lighting ({routeA.streetLighting}/100) and footpath quality ({routeA.footpathQuality}/100) — the two highest-weighted features.
              {routeA.publicFacilityAccess < routeB.publicFacilityAccess ? ` Public facility access (${routeA.publicFacilityAccess}) is lower than ${nameB} (${routeB.publicFacilityAccess}).` : ''}
            </p>
          </div>
          <div>
            <h3 className="text-indigo-400 font-medium mb-1">{nameB} (Score: {scoreB}/100)</h3>
            <p>This route scores higher on public facility access ({routeB.publicFacilityAccess}/100) and help points ({routeB.publicHelpPoints}/100).
              {routeB.streetLighting < routeA.streetLighting ? ` Street lighting (${routeB.streetLighting}) is lower than ${nameA} (${routeA.streetLighting}), which reduces the overall score.` : ''}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-navy-700 disclaimer-banner">
          <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-2" />
          <strong>Important:</strong> A higher score means better observable infrastructure as measured by these five features.
          It does <em>not</em> mean a route is safer for any individual person. Many factors affecting personal safety
          — such as time of day, foot traffic, and local context — are not captured in this model.
        </div>
      </div>

      {/* Weights reference */}
      <div className="card">
        <h2 className="text-white font-semibold mb-3">Feature Weights Reference</h2>
        <div className="space-y-2">
          {(Object.keys(WEIGHTS) as (keyof RouteFeatures)[]).map(key => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-36 text-navy-300 text-sm">{FEATURE_LABELS[key]}</div>
              <div className="flex-1 bg-navy-800 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${WEIGHTS[key] * 100}%` }}
                />
              </div>
              <div className="w-10 text-right text-teal-400 text-sm font-semibold">{WEIGHTS[key] * 100}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
