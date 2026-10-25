import { Shield, Heart, AlertTriangle, Lock, Users, Lightbulb, ExternalLink } from 'lucide-react'

function Section({ title, icon: Icon, color, children }: { title: string, icon: any, color: string, children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="card">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-14">
        <div className="badge-teal mb-4 mx-auto inline-flex">About This Project</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          About SafeRoute AI
        </h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          A transparent, ethical, and research-focused school project exploring how infrastructure data
          and machine learning might support urban safety awareness.
        </p>
      </div>

      <Section title="Why Women's Safety Matters" icon={Heart} color="rose">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>
            Research consistently shows that women and girls disproportionately experience harassment, intimidation,
            and violence in public spaces. This affects their freedom of movement, their access to education,
            work, and community life, and their overall wellbeing.
          </p>
          <p>
            The problem is not about women's behaviour or clothing choices — it is a shared social responsibility
            to create public spaces that are safe, accessible, and welcoming for everyone.
          </p>
          <p>
            Infrastructure plays one part in this: well-lit streets, well-maintained footpaths, accessible
            public facilities, and visible help points can support a sense of safety. However, infrastructure
            is only one part of a much larger picture that includes community norms, law enforcement, and
            cultural attitudes toward gender-based violence.
          </p>
          <div className="bg-navy-800 border-l-4 border-rose-500 rounded-r-xl p-4 mt-3">
            <p className="text-white text-sm">
              "The responsibility for preventing gender-based violence lies with individuals who commit it
              and with the communities and institutions that allow it to continue — not with the people who
              experience it."
            </p>
          </div>
        </div>
      </Section>

      <Section title="How Infrastructure Data May Help" icon={Lightbulb} color="amber">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>
            Better-quality infrastructure data could help:
          </p>
          <ul className="space-y-2">
            {[
              'Urban planners identify areas that need improved lighting, footpath repairs, or additional public facilities.',
              'Community groups advocate for infrastructure investment in underserved areas.',
              'Researchers study the relationship between the built environment and people\'s sense of safety.',
              'Individuals make more informed decisions about routes, when clear and accurate data is available.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            <strong className="text-white">This application is a prototype</strong> exploring these ideas using
            synthetic data. It is not a live safety system.
          </p>
        </div>
      </Section>

      <Section title="Why ML Cannot Guarantee Safety" icon={AlertTriangle} color="amber">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>Machine learning models, including the ones in this project, have significant limitations:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Training Data Bias', desc: 'A model trained on biased or incomplete data will produce biased outputs, potentially disadvantaging already underserved communities.' },
              { title: 'No Causal Relationship', desc: 'High infrastructure scores do not cause safety. Correlation in data does not mean the model can prevent incidents.' },
              { title: 'Context Blindness', desc: 'A model cannot know the time of day, local events, crowd density, or any of the dynamic factors that affect real-world safety.' },
              { title: 'False Confidence', desc: 'Presenting a "safety score" may give users a false sense of security, leading to riskier decisions than they might otherwise make.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-navy-800 rounded-xl p-3">
                <div className="text-amber-300 font-medium text-sm mb-1">{title}</div>
                <div className="text-navy-400 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Missing and Biased Data" icon={AlertTriangle} color="amber">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>Data quality is one of the biggest challenges in any real-world ML system:</p>
          <ul className="space-y-2">
            {[
              'Infrastructure data may be outdated — a streetlight recorded as functional may have broken since the data was collected.',
              'Data is often collected unevenly, with wealthier areas having better-documented infrastructure.',
              'Missing data may be systematically missing from the areas that need attention most.',
              'Community-reported data can reflect existing biases in who reports and what they report.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{item}</span>
              </li>
            ))}
          </ul>
          <p>
            This is why SafeRoute AI explicitly labels all data as synthetic and does not present any scores
            as real-world safety ratings.
          </p>
        </div>
      </Section>

      <Section title="Privacy and Consent" icon={Lock} color="blue">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>Any system that collects or uses data about people's location or movements must:</p>
          <ul className="space-y-2">
            {[
              'Obtain clear, informed consent before collecting location data.',
              'Use data only for the stated purpose.',
              'Allow users to delete their data at any time.',
              'Never share location data with third parties without explicit consent.',
              'Be transparent about how the data is used and stored.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{item}</span>
              </li>
            ))}
          </ul>
          <p>
            <strong className="text-white">This application does not collect any location data.</strong>{' '}
            All inputs are entered manually by the user and are not stored anywhere.
          </p>
        </div>
      </Section>

      <Section title="Shared Responsibility" icon={Users} color="purple">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>
            Tools like SafeRoute AI can play a supporting role, but they are not a solution. Meaningful
            improvement in public safety requires:
          </p>
          <ul className="space-y-2">
            {[
              'Investment in well-designed, accessible, and well-maintained public infrastructure.',
              'Community programs that challenge gender-based harassment and violence.',
              'Effective, trusted, and unbiased law enforcement and justice systems.',
              'Urban planning that prioritises safety for all genders, ages, and abilities.',
              'Education and cultural change that shifts responsibility onto perpetrators, not victims.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Emergency Support" icon={Shield} color="teal">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <div className="disclaimer-banner">
            <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-2" />
            <strong>This application does not provide emergency services.</strong> In an emergency, always contact local emergency services directly.
          </div>
          <p>
            A future version of SafeRoute AI could explore integrating optional safety features such as:
          </p>
          <ul className="space-y-1 text-xs">
            {[
              'A journey-share feature that lets a trusted contact track your route (with consent).',
              'Links to local emergency services and support organisations.',
              'Notifications to trusted contacts if a journey takes longer than expected.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Shield className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs mt-2">
            <strong className="text-white">Design principle:</strong> Any emergency feature must never delay action
            for a machine learning prediction, must require informed consent, and must always put the user's
            immediate safety first.
          </p>
        </div>
      </Section>
    </div>
  )
}
