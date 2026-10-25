import { Heart, AlertTriangle, Lock, Users, Lightbulb, Scale, Phone, CheckCircle2 } from 'lucide-react'

function InfoCard({ icon, title, children, accentColor = '#14b8a6' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; accentColor?: string
}) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderColor: `${accentColor}25` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: `${accentColor}15`, borderRadius: 10, padding: 8 }}>{icon}</div>
        <h2 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem' }}>{title}</h2>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.75 }}>{children}</div>
    </div>
  )
}

function BulletList({ items, color = '#14b8a6' }: { items: string[]; color?: string }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={14} color={color} style={{ marginTop: 4, flexShrink: 0 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-label">About</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.5rem' }}>
          About SafeRoute AI
        </h1>
        <p style={{ color: '#64748b', maxWidth: 620 }}>
          Understanding the motivation, limitations, and ethical principles behind this research project.
        </p>
      </div>

      {/* Why it matters */}
      <InfoCard icon={<Heart size={20} color="#f472b6" />} title="Why Women's Safety Matters" accentColor="#f472b6">
        <p style={{ marginBottom: '0.75rem' }}>
          Research from organisations including UN Women, the World Health Organization, and numerous academic studies
          consistently shows that a significant proportion of women experience harassment, intimidation, or violence
          in public spaces. This affects freedom of movement, participation in public life, and overall wellbeing.
        </p>
        <p style={{ marginBottom: '0.75rem' }}>
          Physical environment plays a role in how safe spaces feel — poor lighting, isolated paths, and limited
          access to help contribute to avoidance behaviour. Better infrastructure does not eliminate risk, but
          it can support more confident and informed navigation of public spaces.
        </p>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>
          Responsibility for safety in public spaces lies with communities, local authorities, and governments —
          not with women to navigate around danger.
        </p>
      </InfoCard>

      {/* What this project does */}
      <InfoCard icon={<Lightbulb size={20} color="#14b8a6" />} title="What This Project Does" accentColor="#14b8a6">
        <p style={{ marginBottom: '0.75rem' }}>
          SafeRoute AI is a school-level machine learning research project that explores whether observable
          infrastructure features can be used to classify the infrastructure quality of walking routes.
        </p>
        <BulletList items={[
          'Compares two routes using 5 measurable infrastructure features.',
          'Calculates a transparent weighted infrastructure indicator (rule-based, not ML).',
          'Demonstrates a full ML training pipeline using scikit-learn.',
          'Presents research methodology in a structured, documented format.',
          'Clearly labels all data as synthetic and all scores as indicators — not safety ratings.',
        ]} />
      </InfoCard>

      {/* What this project does NOT do */}
      <InfoCard icon={<AlertTriangle size={20} color="#f87171" />} title="What This Project Does NOT Do" accentColor="#f87171">
        <BulletList color="#f87171" items={[
          'Predict whether a crime will occur on any route.',
          'Guarantee that any route is safe or unsafe.',
          'Use real infrastructure measurements from any actual location.',
          'Access live location data without user consent.',
          'Create a fake emergency service or send automated alerts.',
          'Claim that a higher score means a route is definitively safer.',
          'Use crime statistics as a label or feature.',
          'Place responsibility for safety on women themselves.',
        ]} />
      </InfoCard>

      {/* Data limitations */}
      <InfoCard icon={<Scale size={20} color="#fbbf24" />} title="Data Quality, Bias, and Limitations" accentColor="#fbbf24">
        <p style={{ marginBottom: '0.75rem' }}>
          The quality of any machine learning system depends entirely on the quality of the data it is trained on.
          In this project:
        </p>
        <BulletList color="#fbbf24" items={[
          'All data is synthetic — generated by code, not collected in the field.',
          'Labels are derived from the same formula as features, creating an artificially easy classification task.',
          'Missing or outdated data would produce misleading results in a real-world deployment.',
          'Infrastructure data that reflects only majority-use patterns may disadvantage underserved communities.',
          'A model trained on one city\'s data is unlikely to generalise well to another city with different infrastructure.',
          'Historical data may embed past inequalities in infrastructure investment.',
        ]} />
      </InfoCard>

      {/* Why ML cannot guarantee safety */}
      <InfoCard icon={<AlertTriangle size={20} color="#fb923c" />} title="Why Machine Learning Cannot Guarantee Personal Safety" accentColor="#fb923c">
        <p style={{ marginBottom: '0.75rem' }}>
          Machine learning models identify patterns in historical data. Safety is dynamic, contextual, and
          shaped by far more variables than any dataset can capture.
        </p>
        <BulletList color="#fb923c" items={[
          'Crime and harassment are rare, unpredictable events — not infrastructure properties.',
          'A well-lit street with good footpaths can still be a location where incidents occur.',
          'Time of day, who else is present, and recent events are not captured by static infrastructure scores.',
          'A model that "scores" routes may create false confidence or false avoidance.',
          'ML systems can amplify existing biases if training data is unrepresentative.',
        ]} />
      </InfoCard>

      {/* Privacy */}
      <InfoCard icon={<Lock size={20} color="#a78bfa" />} title="Privacy and Consent" accentColor="#a78bfa">
        <BulletList color="#a78bfa" items={[
          'This application does not collect, store, or transmit any personal data.',
          'Location access is not requested by default.',
          'All route data used in the demo is fictional and not tied to any real location.',
          'A future version with live data would require clear user consent, data minimisation, and compliance with applicable data protection law.',
          'Community-reviewed data collection processes would be essential before any public deployment.',
        ]} />
      </InfoCard>

      {/* Shared responsibility */}
      <InfoCard icon={<Users size={20} color="#38bdf8" />} title="Shared Responsibility for Safer Public Spaces" accentColor="#38bdf8">
        <p style={{ marginBottom: '0.75rem' }}>
          Technology alone cannot make public spaces safer. Infrastructure improvement, community engagement,
          policy change, and cultural accountability are all essential.
        </p>
        <BulletList color="#38bdf8" items={[
          'Local authorities must invest in well-maintained, well-lit public spaces.',
          'Transport providers should ensure stops and stations feel safe at all hours.',
          'Communities can advocate for infrastructure improvements using tools like this one.',
          'Bystander awareness and community responsibility reduce the burden placed on those targeted.',
          'Research like this project should inform policy, not replace it.',
        ]} />
      </InfoCard>

      {/* Future vision */}
      <InfoCard icon={<Phone size={20} color="#2dd4bf" />} title="Future Emergency-Support Vision" accentColor="#2dd4bf">
        <p style={{ marginBottom: '0.75rem' }}>
          A future version of SafeRoute AI could provide users with quick access to trusted contacts
          and official emergency resources. Important design principles for such a feature:
        </p>
        <BulletList items={[
          'Emergency actions must be immediate — never delayed by an ML prediction.',
          'Contact sharing and alert features require explicit user consent at every step.',
          'The system should integrate with official emergency services, not replace them.',
          'User privacy and data security would be paramount.',
          'Such features should be co-designed with intended users, not built in isolation.',
        ]} />
        <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem' }}>
          <strong style={{ color: '#f87171' }}>In an emergency, always call your local emergency services immediately.</strong>
          <p style={{ color: '#64748b', marginTop: '0.2rem' }}>No application or AI system should delay this action.</p>
        </div>
      </InfoCard>

      {/* How to improve */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(56,189,248,0.06))', border: '1px solid rgba(20,184,166,0.2)' }}>
        <h2 style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>How This System Could Be Improved</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Verified Data', desc: 'Partner with local authorities or community groups to collect real, verified infrastructure measurements.', color: '#14b8a6' },
            { title: 'Community Review', desc: 'Allow community members to review and challenge infrastructure ratings, reducing bias.', color: '#38bdf8' },
            { title: 'Temporal Features', desc: 'Add time-of-day, season, and event data to capture dynamic safety factors.', color: '#a78bfa' },
            { title: 'Expert Labelling', desc: 'Use independent labellers (not formula thresholds) to create more realistic training data.', color: '#fb923c' },
          ].map(c => (
            <div key={c.title} style={{ background: 'var(--navy-950)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, marginBottom: '0.5rem' }} />
              <h3 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
