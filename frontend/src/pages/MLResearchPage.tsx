import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { FlaskConical, AlertTriangle, Info, Play, CheckCircle, Loader, Database } from 'lucide-react'

interface ModelMetrics {
  accuracy: number
  report: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }>
  confusion_matrix: number[][]
  model_name: string
  train_samples: number
  test_samples: number
}

interface TrainResult {
  decision_tree: ModelMetrics
  random_forest: ModelMetrics
  labels: string[]
  note: string
}

const SAMPLE_DATA = [
  { street_lighting: 85, footpath_quality: 90, public_facility_access: 75, public_transport_access: 80, public_help_points: 70, label: 'Better Infrastructure' },
  { street_lighting: 45, footpath_quality: 55, public_facility_access: 40, public_transport_access: 50, public_help_points: 35, label: 'Needs Improvement' },
  { street_lighting: 65, footpath_quality: 60, public_facility_access: 70, public_transport_access: 55, public_help_points: 65, label: 'Moderate Infrastructure' },
  { street_lighting: 20, footpath_quality: 30, public_facility_access: 25, public_transport_access: 35, public_help_points: 20, label: 'Needs Improvement' },
  { street_lighting: 90, footpath_quality: 85, public_facility_access: 80, public_transport_access: 75, public_help_points: 85, label: 'Better Infrastructure' },
  { street_lighting: 55, footpath_quality: 65, public_facility_access: 60, public_transport_access: 60, public_help_points: 55, label: 'Moderate Infrastructure' },
  { street_lighting: 30, footpath_quality: 40, public_facility_access: 35, public_transport_access: 45, public_help_points: 30, label: 'Needs Improvement' },
  { street_lighting: 75, footpath_quality: 70, public_facility_access: 65, public_transport_access: 70, public_help_points: 75, label: 'Better Infrastructure' },
  { street_lighting: 60, footpath_quality: 55, public_facility_access: 50, public_transport_access: 65, public_help_points: 60, label: 'Moderate Infrastructure' },
  { street_lighting: 40, footpath_quality: 35, public_facility_access: 45, public_transport_access: 40, public_help_points: 40, label: 'Needs Improvement' },
]

function MetricBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 0.8 ? 'text-teal-400' : value >= 0.6 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="bg-navy-800 rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{(value * 100).toFixed(1)}%</div>
      <div className="text-navy-400 text-xs mt-1">{label}</div>
    </div>
  )
}

function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  const shortLabels = labels.map(l => l.replace(' Infrastructure', '').replace('Needs ', 'Needs\n'))
  const max = Math.max(...matrix.flat())

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse mx-auto">
        <thead>
          <tr>
            <th className="p-2 text-navy-400" />
            <th className="p-2 text-navy-400 text-center" colSpan={labels.length}>Predicted</th>
          </tr>
          <tr>
            <th className="p-2 text-navy-400">Actual</th>
            {shortLabels.map(l => (
              <th key={l} className="p-2 text-teal-300 text-center whitespace-pre-line text-xs max-w-20">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-2 text-navy-300 whitespace-nowrap text-xs">{shortLabels[i]}</td>
              {row.map((val, j) => (
                <td
                  key={j}
                  className={`p-3 text-center font-bold rounded border border-navy-700 ${
                    i === j
                      ? 'bg-teal-500/30 text-teal-300'
                      : val > 0
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-navy-800 text-navy-500'
                  }`}
                  style={{ opacity: val > 0 ? 0.4 + 0.6 * (val / max) : 0.3 }}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-navy-500 text-xs text-center mt-2">
        Diagonal cells (teal) = correct predictions. Off-diagonal (red) = misclassifications.
      </p>
    </div>
  )
}

function ModelCard({ metrics, labels, color }: { metrics: ModelMetrics; labels: string[]; color: string }) {
  const { accuracy, report, confusion_matrix, model_name, train_samples, test_samples } = metrics
  const classKeys = labels.filter(l => report[l])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${color === 'teal' ? 'text-teal-400' : 'text-purple-400'}`}>
          {model_name}
        </h3>
        <div className="text-navy-400 text-xs">
          Train: {train_samples} | Test: {test_samples}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricBadge value={accuracy} label="Accuracy" />
        <MetricBadge
          value={report['macro avg']?.['f1-score'] ?? 0}
          label="Macro F1"
        />
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left py-2 text-navy-400">Class</th>
              <th className="text-center py-2 text-navy-400">Precision</th>
              <th className="text-center py-2 text-navy-400">Recall</th>
              <th className="text-center py-2 text-navy-400">F1</th>
              <th className="text-center py-2 text-navy-400">Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {classKeys.map(label => (
              <tr key={label}>
                <td className="py-2 text-navy-300 pr-2">{label.replace(' Infrastructure', '')}</td>
                <td className="py-2 text-center text-teal-400">{(report[label].precision * 100).toFixed(1)}%</td>
                <td className="py-2 text-center text-blue-400">{(report[label].recall * 100).toFixed(1)}%</td>
                <td className="py-2 text-center text-purple-400">{(report[label]['f1-score'] * 100).toFixed(1)}%</td>
                <td className="py-2 text-center text-navy-400">{report[label].support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-white font-medium text-sm mb-3">Confusion Matrix</h4>
      <ConfusionMatrix matrix={confusion_matrix} labels={labels} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium text-xs mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.name}: <strong>{(p.value * 100).toFixed(1)}%</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function MLResearchPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<TrainResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const trainModels = async () => {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/train', { method: 'POST' })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data: TrainResult = await res.json()
      setResult(data)
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not connect to the backend. Make sure the FastAPI server is running.')
      setStatus('error')
    }
  }

  const comparisonData = result
    ? [
        { metric: 'Accuracy', DT: result.decision_tree.accuracy, RF: result.random_forest.accuracy },
        { metric: 'Macro F1', DT: result.decision_tree.report['macro avg']?.['f1-score'] ?? 0, RF: result.random_forest.report['macro avg']?.['f1-score'] ?? 0 },
        { metric: 'Precision', DT: result.decision_tree.report['macro avg']?.precision ?? 0, RF: result.random_forest.report['macro avg']?.precision ?? 0 },
        { metric: 'Recall', DT: result.decision_tree.report['macro avg']?.recall ?? 0, RF: result.random_forest.report['macro avg']?.recall ?? 0 },
      ]
    : []

  const dtAcc = result?.decision_tree.accuracy ?? 0
  const rfAcc = result?.random_forest.accuracy ?? 0
  const winner = dtAcc > rfAcc ? 'Decision Tree' : rfAcc > dtAcc ? 'Random Forest' : 'tied'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title">ML Research Lab</h1>
        <p className="section-subtitle">Train real scikit-learn models and view genuine evaluation metrics.</p>
      </div>

      {/* Concept explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Rule-Based Score',
            badge: 'Used on Compare Page',
            badgeColor: 'badge-teal',
            desc: 'A fixed formula with predefined weights (e.g., lighting × 0.35). Transparent and deterministic, but does not learn from data.',
            icon: '⚖️',
          },
          {
            label: 'ML Prediction',
            badge: 'Used on This Page',
            badgeColor: 'badge-purple',
            desc: 'A model trained on examples that learns patterns in the data. Performance depends on training data quality and size.',
            icon: '🤖',
          },
          {
            label: 'Real-World Safety',
            badge: 'Not in this app',
            badgeColor: 'badge-amber',
            desc: 'Requires verified, real data; accounts for time of day, foot traffic, and many factors not captured in this prototype.',
            icon: '🌍',
          },
        ].map(({ label, badge, badgeColor, desc, icon }) => (
          <div key={label} className="card">
            <div className="text-3xl mb-3">{icon}</div>
            <div className={`${badgeColor} mb-2`}>{badge}</div>
            <h3 className="text-white font-semibold mb-2">{label}</h3>
            <p className="text-navy-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Synthetic data notice */}
      <div className="disclaimer-banner mb-8 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs leading-relaxed">
          <strong>Synthetic dataset notice.</strong> The ML models are trained on algorithmically generated data.
          Reported metrics reflect performance on that synthetic dataset only. These results cannot be used to
          draw conclusions about real-world infrastructure quality or personal safety.
        </div>
      </div>

      {/* Sample data table */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-teal-400" />
          <h2 className="text-white font-semibold">Sample Dataset (first 10 rows of 120)</h2>
          <span className="badge-amber ml-auto">Synthetic Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy-700">
                {['Street Lighting', 'Footpath Quality', 'Facility Access', 'Transport Access', 'Help Points', 'Label'].map(h => (
                  <th key={h} className="text-left py-2 pr-3 text-navy-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {SAMPLE_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-navy-800/50 transition-colors">
                  <td className="py-2 pr-3 text-navy-300">{row.street_lighting}</td>
                  <td className="py-2 pr-3 text-navy-300">{row.footpath_quality}</td>
                  <td className="py-2 pr-3 text-navy-300">{row.public_facility_access}</td>
                  <td className="py-2 pr-3 text-navy-300">{row.public_transport_access}</td>
                  <td className="py-2 pr-3 text-navy-300">{row.public_help_points}</td>
                  <td className="py-2 pr-3">
                    <span className={`badge ${
                      row.label === 'Better Infrastructure' ? 'badge-teal' :
                      row.label === 'Moderate Infrastructure' ? 'badge-blue' :
                      'badge-amber'
                    }`}>{row.label.replace(' Infrastructure', '')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train button */}
      <div className="card mb-8 text-center">
        <h2 className="text-white font-semibold text-lg mb-2">Train the Models</h2>
        <p className="text-navy-400 text-sm mb-6 max-w-lg mx-auto">
          Click below to train a Decision Tree and a Random Forest on the 120-row synthetic dataset.
          The metrics shown will be the <strong className="text-white">real output</strong> from scikit-learn.
          Make sure the FastAPI backend is running on port 8000.
        </p>
        <button
          id="train-models-btn"
          onClick={trainModels}
          disabled={status === 'loading'}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <><Loader className="w-5 h-5 animate-spin" /> Training Models...</>
          ) : (
            <><Play className="w-5 h-5" /> Train Models</>
          )}
        </button>
        <div className="info-banner mt-4 text-left max-w-lg mx-auto">
          <Info className="w-4 h-4 text-teal-400 inline mr-2" />
          <span className="text-xs">Start the backend first: <code className="bg-navy-900 px-1 rounded">cd backend && uvicorn main:app --reload</code></span>
        </div>
      </div>

      {/* Error state */}
      {status === 'error' && (
        <div className="card mb-8 border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-red-300 font-semibold mb-1">Training Failed</div>
              <div className="text-red-400 text-sm">{errorMsg}</div>
              <div className="text-navy-400 text-xs mt-2">
                To start the backend: <code className="bg-navy-900 px-1 rounded">cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'success' && result && (
        <>
          <div className="info-banner mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400" />
            <span className="text-xs"><strong>Training complete!</strong> {result.note}</span>
          </div>

          {/* Model comparison chart */}
          <div className="card mb-8">
            <h2 className="text-white font-semibold mb-4">Model Performance Comparison</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3668" />
                <XAxis dataKey="metric" tick={{ fill: '#7890b4', fontSize: 11 }} />
                <YAxis domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#7890b4', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#7890b4', fontSize: 12 }} />
                <Bar dataKey="DT" name="Decision Tree" fill="#14b8a6" radius={[4,4,0,0]} />
                <Bar dataKey="RF" name="Random Forest" fill="#a78bfa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 info-banner text-xs">
              <Info className="w-4 h-4 text-teal-400 inline mr-2" />
              {winner === 'tied'
                ? 'Both models performed equally on this synthetic dataset.'
                : `${winner} achieved higher accuracy on this synthetic test set. This may vary with different random seeds or data samples. Synthetic data results should not be interpreted as real-world performance.`}
            </div>
          </div>

          {/* Per-model cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModelCard metrics={result.decision_tree} labels={result.labels} color="teal" />
            <ModelCard metrics={result.random_forest} labels={result.labels} color="purple" />
          </div>
        </>
      )}
    </div>
  )
}
