import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { Brain, Play, AlertTriangle, CheckCircle2, Loader2, Database, TrendingUp, Info } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface ClassMetrics {
  precision: number
  recall: number
  'f1-score': number
  support: number
}

interface ModelResult {
  name: string
  accuracy: number
  classification_report: Record<string, ClassMetrics | number | object>
  confusion_matrix: number[][]
  confusion_matrix_labels: string[]
  feature_importances?: Record<string, number>
  hyperparameters: Record<string, number>
}

interface TrainResponse {
  data_info: {
    total_samples: number
    train_samples: number
    test_samples: number
    features: string[]
    label_distribution: Record<string, number>
    data_type: string
  }
  models: {
    decision_tree: ModelResult
    random_forest: ModelResult
  }
  better_model: string
  comparison_note: string
  disclaimer: string
}

// ── Backend URL ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

// ── Helpers ────────────────────────────────────────────────────────────────────
const CLASS_LABELS = ['Needs Improvement', 'Moderate Infrastructure', 'Better Infrastructure']
const CLASS_COLORS: Record<string, string> = {
  'Needs Improvement': '#f87171',
  'Moderate Infrastructure': '#fbbf24',
  'Better Infrastructure': '#2dd4bf',
}

function metricPercent(v: number) { return `${(v * 100).toFixed(1)}%` }

function MetricCard({ label, value, color = '#14b8a6' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--navy-950)', borderRadius: 12, padding: '1rem 1.25rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.8rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  if (!matrix?.length) return null
  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
        Rows = Actual class · Columns = Predicted class
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.82rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', color: '#475569', textAlign: 'right' }}>Actual ↓ / Predicted →</th>
              {labels.map(l => (
                <th key={l} style={{ padding: '0.5rem 0.75rem', color: CLASS_COLORS[l] || '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>{l.split(' ')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '0.5rem 0.75rem', color: CLASS_COLORS[labels[i]] || '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textAlign: 'right' }}>{labels[i]?.split(' ')[0]}</td>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    padding: '0.5rem 1rem', textAlign: 'center', fontWeight: i === j ? 700 : 400,
                    background: i === j ? 'rgba(20,184,166,0.15)' : 'transparent',
                    color: i === j ? '#2dd4bf' : cell > 0 ? '#f87171' : '#475569',
                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4,
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ModelCard({ model, isBetter }: { model: ModelResult; isBetter: boolean }) {
  const color = model.name === 'Decision Tree' ? '#a78bfa' : '#14b8a6'
  const report = model.classification_report

  // Extract per-class metrics
  const classMetrics = CLASS_LABELS.map(label => {
    const m = report[label] as ClassMetrics | undefined
    return m ? { label, ...m } : null
  }).filter(Boolean) as (ClassMetrics & { label: string })[]

  const barData = classMetrics.map(m => ({
    name: m.label.split(' ')[0],
    Precision: parseFloat((m.precision * 100).toFixed(1)),
    Recall: parseFloat((m.recall * 100).toFixed(1)),
    F1: parseFloat((m['f1-score'] * 100).toFixed(1)),
  }))

  const avgMetrics = report['weighted avg'] as ClassMetrics | undefined

  return (
    <div className="card" style={{ border: isBetter ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
      {isBetter && (
        <div style={{ position: 'absolute', top: -12, right: 16 }}>
          <span className="badge" style={{ background: `${color}25`, color, border: `1px solid ${color}50` }}>
            <TrendingUp size={11} /> Higher Accuracy
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: `${color}20`, borderRadius: 10, padding: '8px' }}>
          <Brain size={20} color={color} />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>{model.name}</h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            max_depth={model.hyperparameters.max_depth}{model.hyperparameters.n_estimators ? ` · n_estimators=${model.hyperparameters.n_estimators}` : ''}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <MetricCard label="Accuracy" value={metricPercent(model.accuracy)} color={color} />
        <MetricCard label="Wt. Precision" value={avgMetrics ? metricPercent(avgMetrics.precision) : '—'} />
        <MetricCard label="Wt. Recall" value={avgMetrics ? metricPercent(avgMetrics.recall) : '—'} />
        <MetricCard label="Wt. F1" value={avgMetrics ? metricPercent(avgMetrics['f1-score']) : '—'} />
      </div>

      {/* Per-class bar chart */}
      {barData.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Per-Class Metrics (%)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.82rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
              <Bar dataKey="Precision" fill="#a78bfa" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Recall" fill="#38bdf8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="F1" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Confusion matrix */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Confusion Matrix</p>
        <ConfusionMatrix matrix={model.confusion_matrix} labels={model.confusion_matrix_labels} />
      </div>

      {/* Feature importances (RF only) */}
      {model.feature_importances && (
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem' }}>Feature Importances</p>
          {Object.entries(model.feature_importances)
            .sort(([, a], [, b]) => b - a)
            .map(([feat, imp]) => (
              <div key={feat} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                  <span>{feat.replace(/_/g, ' ')}</span>
                  <span style={{ color }}>{(imp * 100).toFixed(1)}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${imp * 100}%`, background: color }} />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// ── Sample Dataset Table ───────────────────────────────────────────────────────
interface DataRow {
  street_lighting: number
  footpath_quality: number
  public_facility_access: number
  public_transport_access: number
  public_help_points: number
  infrastructure_quality_label: string
}

function DatasetTable({ rows }: { rows: DataRow[] }) {
  const labelColor = (l: string) => CLASS_COLORS[l] || '#94a3b8'
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Street Lighting</th>
            <th>Footpath Quality</th>
            <th>Facility Access</th>
            <th>Transport</th>
            <th>Help Points</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={{ color: '#475569' }}>{i + 1}</td>
              <td>{row.street_lighting}</td>
              <td>{row.footpath_quality}</td>
              <td>{row.public_facility_access}</td>
              <td>{row.public_transport_access}</td>
              <td>{row.public_help_points}</td>
              <td><span style={{ color: labelColor(row.infrastructure_quality_label), fontWeight: 600, fontSize: '0.8rem' }}>{row.infrastructure_quality_label}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Research() {
  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<TrainResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [dataRows, setDataRows] = useState<DataRow[]>([])
  const [dataStatus, setDataStatus] = useState<Status>('idle')

  const trainModels = async () => {
    setStatus('loading')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/train`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.detail || `HTTP ${res.status}`)
      }
      const data: TrainResponse = await res.json()
      setResults(data)
      setStatus('success')
    } catch (e: any) {
      setError(e.message || 'Failed to connect to backend. Make sure the Python server is running on port 8000.')
      setStatus('error')
    }
  }

  const loadDataset = async () => {
    setDataStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/dataset/sample?n=20`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDataRows(data.rows)
      setDataStatus('success')
    } catch (e: any) {
      setDataStatus('error')
    }
  }

  const accBarData = results ? [
    { name: 'Decision Tree', accuracy: parseFloat((results.models.decision_tree.accuracy * 100).toFixed(1)), fill: '#a78bfa' },
    { name: 'Random Forest', accuracy: parseFloat((results.models.random_forest.accuracy * 100).toFixed(1)), fill: '#14b8a6' },
  ] : []

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-label">ML Research Lab</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Machine Learning Research Pipeline
        </h1>
        <p style={{ color: '#64748b', maxWidth: 700 }}>
          Train and evaluate real classifiers on synthetic infrastructure data. All results are generated by scikit-learn — nothing is hardcoded.
        </p>
      </div>

      {/* Synthetic Data Warning */}
      <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '0.855rem', color: '#fbbf24' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Synthetic Dataset Notice</strong>
          <p style={{ color: '#a16207', marginTop: '0.2rem' }}>
            All training data is artificially generated with a fixed random seed. Labels are assigned by thresholds, not real-world measurements.
            Results show performance on synthetic data only and cannot establish real-world predictive accuracy.
          </p>
        </div>
      </div>

      {/* Concept Explainer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Rule-Based Score', desc: 'A fixed weighted formula applied to feature values. Transparent but inflexible — weights are set by the researcher.', color: '#38bdf8' },
          { title: 'ML Prediction', desc: 'A model trained on labelled examples that learns patterns. Can generalise but requires quality data and may overfit.', color: '#a78bfa' },
          { title: 'Real Safety Assessment', desc: 'Requires verified field data, community input, and expert evaluation. Far beyond the scope of any single ML model.', color: '#fb923c' },
        ].map(c => (
          <div key={c.title} className="card" style={{ borderColor: `${c.color}30` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, marginBottom: '0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{c.title}</h3>
            <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6 }}>{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Dataset Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={20} color="#38bdf8" />
            <div>
              <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>Sample Dataset Preview</h3>
              <p style={{ fontSize: '0.78rem', color: '#475569' }}>150 synthetic rows · 5 features · 3 classes</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={loadDataset} disabled={dataStatus === 'loading'} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            {dataStatus === 'loading' ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</> : 'Load Sample Data'}
          </button>
        </div>

        {/* Dataset description */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { col: 'street_lighting', desc: 'Observed lighting quality (0–100)' },
            { col: 'footpath_quality', desc: 'Pavement condition score (0–100)' },
            { col: 'public_facility_access', desc: 'Proximity to public facilities (0–100)' },
            { col: 'public_transport_access', desc: 'Distance to transport stops (0–100)' },
            { col: 'public_help_points', desc: 'Availability of help points (0–100)' },
          ].map(c => (
            <div key={c.col} style={{ background: 'var(--navy-950)', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
              <code style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'block', marginBottom: '0.2rem' }}>{c.col}</code>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {dataStatus === 'success' && dataRows.length > 0 && <DatasetTable rows={dataRows} />}
        {dataStatus === 'error' && (
          <div style={{ color: '#f87171', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
            Could not load dataset. Ensure the backend server is running on port 8000.
          </div>
        )}
        {dataStatus === 'idle' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.875rem' }}>
            Click "Load Sample Data" to preview the synthetic training dataset.
          </div>
        )}
      </div>

      {/* Train Button */}
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(20,184,166,0.2)', textAlign: 'center', padding: '2.5rem' }}>
        <Brain size={36} color="#14b8a6" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Train & Evaluate Models</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
          Calls the FastAPI backend to train Decision Tree and Random Forest classifiers using scikit-learn.
          Returns real accuracy, precision, recall, F1, and confusion matrix values.
        </p>
        <button
          id="train-models-btn"
          className="btn-primary"
          onClick={trainModels}
          disabled={status === 'loading'}
          style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}
        >
          {status === 'loading' ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Training…</>
          ) : (
            <><Play size={18} /> Train Models</>
          )}
        </button>

        {status === 'error' && (
          <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '1rem', color: '#f87171', fontSize: '0.875rem', maxWidth: 600, margin: '1rem auto 0' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {status === 'success' && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#2dd4bf', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} /> Training complete — real metrics from scikit-learn displayed below
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="animate-fade-in">
          {/* Data Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', fontSize: '0.95rem' }}>Dataset Split</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                {[
                  { label: 'Total', val: results.data_info.total_samples, color: '#f8fafc' },
                  { label: 'Train (80%)', val: results.data_info.train_samples, color: '#14b8a6' },
                  { label: 'Test (20%)', val: results.data_info.test_samples, color: '#38bdf8' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--navy-950)', borderRadius: 10, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.4rem', color: s.color, lineHeight: 1 }}>{s.val}</p>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Class Distribution</p>
                {Object.entries(results.data_info.label_distribution).map(([label, count]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CLASS_COLORS[label] || '#94a3b8', flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8' }}>{label}</span>
                    <span style={{ color: CLASS_COLORS[label] || '#94a3b8', fontWeight: 600, marginLeft: 'auto' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span className="badge badge-synthetic">SYNTHETIC DATA</span>
              <span style={{ color: '#64748b' }}>{results.data_info.data_type}</span>
            </div>
          </div>

          {/* Accuracy comparison bar */}
          {accBarData.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Model Accuracy Comparison</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Test set accuracy (%) — higher is better on this synthetic dataset</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={accBarData} layout="vertical" margin={{ top: 0, right: 40, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} width={120} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.85rem' }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {accBarData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparison note */}
          <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <Info size={16} color="#14b8a6" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: '#f8fafc' }}>Comparison: </strong>
              <span style={{ color: '#94a3b8' }}>{results.comparison_note}</span>
              <p style={{ color: '#64748b', marginTop: '0.3rem', fontSize: '0.8rem' }}>{results.disclaimer}</p>
            </div>
          </div>

          {/* Model cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <ModelCard model={results.models.decision_tree} isBetter={results.better_model === 'decision_tree'} />
            <ModelCard model={results.models.random_forest} isBetter={results.better_model === 'random_forest'} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
