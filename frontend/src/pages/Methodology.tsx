import { BookOpen, Target, HelpCircle, Database, Cpu, FlaskConical, BarChart2, AlertOctagon, Lightbulb, CheckCircle2 } from 'lucide-react'

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        {icon}
        <h2 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.1rem' }}>{title}</h2>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

function BulletList({ items, color = '#14b8a6' }: { items: string[]; color?: string }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={14} color={color} style={{ marginTop: 4, flexShrink: 0 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Methodology() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Title block */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(56,189,248,0.06))', border: '1px solid rgba(20,184,166,0.2)', textAlign: 'center', padding: '2.5rem' }}>
        <span className="badge badge-teal" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <BookOpen size={12} /> Research Paper
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.3, marginBottom: '1rem' }}>
          SafeRoute AI: Evaluating Machine Learning for Infrastructure-Based Walking Route Comparison to Support Women's Safety
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', fontSize: '0.82rem' }}>
          {['School Science Exhibition 2026', 'Machine Learning', 'Women\'s Safety Research', 'Infrastructure Analysis'].map(tag => (
            <span key={tag} className="badge badge-sky">{tag}</span>
          ))}
        </div>
      </div>

      {/* Research Question */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderColor: 'rgba(56,189,248,0.25)', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', marginBottom: '0.5rem' }}>Research Question</p>
          <p style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>
            "Can machine learning classify walking-route infrastructure quality using observable infrastructure features?"
          </p>
        </div>
        <div className="card" style={{ borderColor: 'rgba(167,139,250,0.25)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '0.5rem' }}>Hypothesis</p>
          <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontStyle: 'italic', lineHeight: 1.6 }}>
            "A trained model can classify infrastructure quality from recorded features, but its performance depends on data quality, representative samples, and generalisation to new locations."
          </p>
        </div>
      </div>

      {/* Problem Statement */}
      <Section icon={<HelpCircle size={20} color="#f87171" />} title="Problem Statement">
        <p style={{ marginBottom: '0.75rem' }}>
          Women's safety in public spaces is a significant social concern. Research consistently shows that perceived safety
          is influenced by physical environmental factors such as lighting, footpath quality, and proximity to help points
          and public transport.
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          Existing navigation tools provide route guidance based on distance or time but rarely consider infrastructure
          quality as a factor. This project investigates whether machine learning can be used to classify the infrastructure
          quality of walking routes using observable features, which could support more informed route selection.
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Important: This project does not claim to predict crime or guarantee personal safety. Infrastructure quality
          is one of many factors that influence perceived and actual safety.
        </p>
      </Section>

      {/* Aims */}
      <Section icon={<Target size={20} color="#14b8a6" />} title="Aims and Objectives">
        <BulletList items={[
          'Identify observable infrastructure features associated with walking-route quality.',
          'Build a transparent rule-based infrastructure indicator using a weighted formula.',
          'Generate a synthetic dataset suitable for demonstrating an ML classification pipeline.',
          'Train and evaluate Decision Tree and Random Forest classifiers.',
          'Compare model performance using standard evaluation metrics.',
          'Identify limitations of ML-based infrastructure classification.',
          'Present findings clearly for a non-expert audience.',
        ]} />
      </Section>

      {/* Dataset */}
      <Section icon={<Database size={20} color="#38bdf8" />} title="Dataset Description">
        <p style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: '#f8fafc' }}>Type:</strong> Synthetic dataset generated using NumPy with a fixed random seed (42) for reproducibility.
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: '#f8fafc' }}>Size:</strong> 150 rows, 5 input features, 1 target label column.
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: '#f8fafc' }}>Label assignment:</strong> Labels are assigned by applying the same weighted formula used in the infrastructure indicator:
          scores below 45 → "Needs Improvement"; 45–68 → "Moderate Infrastructure"; above 68 → "Better Infrastructure".
        </p>
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '0.75rem', marginTop: '0.75rem' }}>
          <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>⚠ Limitation:</strong>
          <p style={{ color: '#a16207', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Because labels are derived from the same formula as the features, the models learn a deterministic mapping.
            This is appropriate for demonstrating the ML pipeline but does not reflect real-world classification difficulty.
            Real deployment would require verified, independently labelled field data.
          </p>
        </div>
      </Section>

      {/* Feature Selection */}
      <Section icon={<BarChart2 size={20} color="#fb923c" />} title="Feature Selection">
        <p style={{ marginBottom: '0.75rem' }}>Features were chosen based on infrastructure factors identified in environmental criminology and urban safety research:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { feat: 'street_lighting', reason: 'Lighting quality strongly associated with perceived security (35% weight)', color: '#14b8a6' },
            { feat: 'footpath_quality', reason: 'Pavement condition affects walkability and mobility options (25%)', color: '#38bdf8' },
            { feat: 'public_facility_access', reason: 'Proximity to facilities provides passive surveillance (15%)', color: '#a78bfa' },
            { feat: 'public_transport_access', reason: 'Access to transport enables route flexibility (15%)', color: '#fb923c' },
            { feat: 'public_help_points', reason: 'Emergency call points provide a sense of safety (10%)', color: '#f472b6' },
          ].map(f => (
            <div key={f.feat} style={{ background: 'var(--navy-950)', borderRadius: 8, padding: '0.75rem' }}>
              <code style={{ fontSize: '0.78rem', color: f.color, display: 'block', marginBottom: '0.35rem' }}>{f.feat}</code>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{f.reason}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Model Selection */}
      <Section icon={<Cpu size={20} color="#a78bfa" />} title="Model Selection">
        <p style={{ marginBottom: '0.75rem' }}>Two models were selected for comparison:</p>
        <BulletList color="#a78bfa" items={[
          'Decision Tree Classifier — Simple, interpretable, and easy to visualise. Prone to overfitting without depth constraints. max_depth=5 used.',
          'Random Forest Classifier — An ensemble of 100 decision trees. Generally more robust to noise and overfitting than a single tree. max_depth=5, n_estimators=100.',
          'Both models were trained with random_state=42 for reproducibility.',
          'StandardScaler was applied to normalise features before training.',
        ]} />
      </Section>

      {/* Training Methodology */}
      <Section icon={<FlaskConical size={20} color="#2dd4bf" />} title="Training and Testing Methodology">
        <BulletList items={[
          'Dataset was split 80% training / 20% test using stratified sampling to preserve class proportions.',
          'The train/test split was performed BEFORE any preprocessing to prevent data leakage.',
          'StandardScaler was fit on training data only and used to transform both train and test sets.',
          'Models were trained exclusively on the training partition.',
          'Evaluation was performed on the held-out test partition only.',
          'Fixed random_state=42 used throughout for reproducibility.',
        ]} />
      </Section>

      {/* Evaluation Metrics */}
      <Section icon={<BarChart2 size={20} color="#38bdf8" />} title="Evaluation Metrics">
        <BulletList color="#38bdf8" items={[
          'Accuracy — proportion of correct predictions on the test set.',
          'Precision — of all instances predicted as a class, what fraction were correct.',
          'Recall — of all actual instances of a class, what fraction were correctly identified.',
          'F1-Score — harmonic mean of precision and recall; balances both measures.',
          'Confusion Matrix — visualises true positives, false positives, and misclassifications per class.',
          'Feature Importances (Random Forest only) — Gini impurity-based measure of each feature\'s contribution.',
        ]} />
      </Section>

      {/* Limitations */}
      <Section icon={<AlertOctagon size={20} color="#f87171" />} title="Limitations and Ethical Considerations">
        <BulletList color="#f87171" items={[
          'Synthetic data: Labels are derived from the same formula as features — real performance on genuine data would likely differ significantly.',
          'No crime data: The project deliberately does not use crime statistics, which can be biased and are not a measure of infrastructure quality.',
          'Feature coverage: Many safety-relevant factors (CCTV, community demographics, time of day) are not included.',
          'No field validation: Features have not been measured in real locations; scores are entirely fictitious.',
          'Algorithmic bias: Models trained on unrepresentative data may produce misleading results for underserved areas.',
          'Responsibility: Technology cannot replace safer public spaces, better infrastructure investment, and community action.',
          'Privacy: Collecting real location data requires informed consent and data protection compliance.',
          'Overfitting risk: Performance on this synthetic dataset does not guarantee generalisation to real-world route data.',
        ]} />
      </Section>

      {/* Future Improvements */}
      <Section icon={<Lightbulb size={20} color="#fbbf24" />} title="Future Improvements">
        <BulletList color="#fbbf24" items={[
          'Collect verified field data through community surveys and local authority infrastructure records.',
          'Include independent labels from trained observers rather than derived formula thresholds.',
          'Add temporal features (time of day, season) which may affect infrastructure perception.',
          'Investigate explainability tools (SHAP values) to better understand model decisions.',
          'Conduct community co-design workshops to ensure the tool reflects lived experience.',
          'Evaluate fairness metrics across different neighbourhood types.',
          'Pilot with a small, consenting group of participants using real route data.',
          'Partner with local authorities for verified infrastructure datasets.',
        ]} />
      </Section>
    </div>
  )
}
