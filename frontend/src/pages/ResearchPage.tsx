import {
  BookOpen, Target, HelpCircle, Database, FlaskConical, BarChart3,
  AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react'

function Section({ id, icon: Icon, title, children }: { id: string, icon: any, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="card">{children}</div>
    </section>
  )
}

export default function ResearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title block */}
      <div className="text-center mb-14">
        <div className="badge-teal mb-4 mx-auto inline-flex">Research Methodology</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          SafeRoute AI: Evaluating Machine Learning for Infrastructure-Based
          Walking Route Comparison to Support Women's Safety
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="card py-3">
            <div className="text-navy-400 text-xs uppercase tracking-wide mb-1">Type</div>
            <div className="text-white font-medium">School Science Exhibition</div>
          </div>
          <div className="card py-3">
            <div className="text-navy-400 text-xs uppercase tracking-wide mb-1">Data Type</div>
            <div className="text-amber-300 font-medium">Synthetic (Demonstration Only)</div>
          </div>
          <div className="card py-3">
            <div className="text-navy-400 text-xs uppercase tracking-wide mb-1">Models</div>
            <div className="text-white font-medium">Decision Tree, Random Forest</div>
          </div>
        </div>
      </div>

      {/* Research Question */}
      <Section id="research-question" icon={HelpCircle} title="Research Question & Hypothesis">
        <div className="space-y-4 text-navy-300 text-sm leading-relaxed">
          <div className="bg-navy-800 rounded-xl p-4 border-l-4 border-teal-500">
            <div className="text-teal-300 font-semibold text-xs uppercase tracking-wide mb-1">Research Question</div>
            <p className="text-white text-base">
              "Can machine learning classify walking-route infrastructure quality using observable infrastructure features?"
            </p>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 border-l-4 border-blue-500">
            <div className="text-blue-300 font-semibold text-xs uppercase tracking-wide mb-1">Hypothesis</div>
            <p className="text-white text-base">
              "A trained model can classify infrastructure quality from recorded features, but its performance depends on
              data quality, representative samples, and generalization to new locations."
            </p>
          </div>
        </div>
      </Section>

      {/* Problem Statement */}
      <Section id="problem-statement" icon={BookOpen} title="Problem Statement">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <p>
            Women and girls disproportionately report feeling unsafe in public spaces, particularly when walking alone.
            Research in urban planning and environmental criminology suggests that certain infrastructure characteristics
            — such as street lighting, visibility, and proximity to public facilities — may influence how safe people feel
            in public spaces.
          </p>
          <p>
            However, infrastructure data is often unavailable, inconsistent, or scattered across multiple sources.
            This project explores whether machine learning can be used to classify walking route infrastructure quality
            from a small set of observable features, which could assist urban planners and community researchers in
            identifying areas needing infrastructure improvement.
          </p>
          <div className="disclaimer-banner mt-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-2" />
            <strong>Important scope limitation:</strong> This project does not attempt to predict crime, model criminal behavior,
            or provide personal safety guarantees. Infrastructure quality is only one of many factors affecting how safe
            a space feels or is.
          </div>
        </div>
      </Section>

      {/* Aims & Objectives */}
      <Section id="aims" icon={Target} title="Aims & Objectives">
        <div className="text-navy-300 text-sm leading-relaxed">
          <h3 className="text-white font-semibold mb-3">Aim</h3>
          <p className="mb-4">
            To investigate whether machine learning classifiers can accurately categorize walking route infrastructure
            quality using five observable features, using a synthetic dataset as a proof-of-concept.
          </p>
          <h3 className="text-white font-semibold mb-3">Objectives</h3>
          <ol className="space-y-2">
            {[
              'Build and document a synthetic dataset of walking route infrastructure features with three quality labels.',
              'Train and evaluate a Decision Tree Classifier and a Random Forest Classifier.',
              'Compare model performance using accuracy, precision, recall, F1-score, and confusion matrices.',
              'Build an interactive web application to demonstrate the comparison system.',
              'Clearly communicate the limitations, ethical considerations, and future research directions.',
            ].map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Dataset */}
      <Section id="dataset" icon={Database} title="Dataset Description">
        <div className="space-y-4 text-navy-300 text-sm leading-relaxed">
          <div className="info-banner">
            This project uses a <strong className="text-teal-300">synthetic dataset</strong> generated for research demonstration purposes.
            It does not contain real measurements from any specific location. Results reflect performance on synthetic data only
            and cannot be used to draw conclusions about real-world infrastructure quality.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="text-left py-2 pr-4 text-navy-400 font-medium">Column</th>
                  <th className="text-left py-2 pr-4 text-navy-400 font-medium">Range</th>
                  <th className="text-left py-2 text-navy-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {[
                  ['street_lighting', '0–100', 'Quality and coverage of street lighting'],
                  ['footpath_quality', '0–100', 'Condition and accessibility of footpaths'],
                  ['public_facility_access', '0–100', 'Proximity to public buildings and shops'],
                  ['public_transport_access', '0–100', 'Distance to bus/train facilities'],
                  ['public_help_points', '0–100', 'Presence of emergency phones/CCTV'],
                  ['infrastructure_quality_label', 'Categorical', 'Target: Needs Improvement / Moderate / Better Infrastructure'],
                ].map(([col, range, desc]) => (
                  <tr key={col}>
                    <td className="py-2 pr-4 text-teal-300 font-mono text-xs">{col}</td>
                    <td className="py-2 pr-4 text-navy-300">{range}</td>
                    <td className="py-2 text-navy-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Total Samples', value: '120' },
              { label: 'Training Split', value: '80%' },
              { label: 'Test Split', value: '20%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-navy-800 rounded-xl p-3">
                <div className="text-2xl font-bold text-teal-400">{value}</div>
                <div className="text-navy-400 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Model Selection */}
      <Section id="models" icon={FlaskConical} title="Model Selection">
        <div className="space-y-4 text-navy-300 text-sm leading-relaxed">
          <p>Two classification models were selected for their interpretability and suitability for small datasets:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'Decision Tree Classifier',
                pros: ['Highly interpretable', 'Visual decision path', 'No feature scaling needed'],
                cons: ['Prone to overfitting', 'Can be unstable with small data'],
                color: 'teal',
              },
              {
                name: 'Random Forest Classifier',
                pros: ['More robust than single tree', 'Reduces overfitting via ensemble', 'Better generalization'],
                cons: ['Less interpretable', 'Higher computational cost'],
                color: 'purple',
              },
            ].map(({ name, pros, cons, color }) => (
              <div key={name} className="bg-navy-800 rounded-xl p-4">
                <div className={`font-semibold text-${color}-400 mb-3`}>{name}</div>
                <div className="mb-2">
                  <div className="text-xs text-navy-400 uppercase tracking-wide mb-1">Advantages</div>
                  <ul className="space-y-1">
                    {pros.map(p => <li key={p} className="flex items-center gap-1.5 text-xs"><CheckCircle className="w-3 h-3 text-teal-400" />{p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-navy-400 uppercase tracking-wide mb-1">Limitations</div>
                  <ul className="space-y-1">
                    {cons.map(c => <li key={c} className="flex items-center gap-1.5 text-xs"><ChevronRight className="w-3 h-3 text-amber-400" />{c}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p>
            Both models were trained using scikit-learn with a fixed random seed (42) for reproducibility.
            Data was split before any preprocessing to prevent data leakage.
          </p>
        </div>
      </Section>

      {/* Evaluation */}
      <Section id="evaluation" icon={BarChart3} title="Evaluation Metrics">
        <div className="space-y-3 text-navy-300 text-sm leading-relaxed">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { metric: 'Accuracy', desc: 'Overall proportion of correct predictions' },
              { metric: 'Precision', desc: 'Of predicted positives, how many are correct' },
              { metric: 'Recall', desc: 'Of actual positives, how many were found' },
              { metric: 'F1-Score', desc: 'Harmonic mean of precision and recall' },
            ].map(({ metric, desc }) => (
              <div key={metric} className="bg-navy-800 rounded-xl p-3 text-center">
                <div className="text-teal-400 font-semibold text-sm mb-1">{metric}</div>
                <div className="text-navy-400 text-xs">{desc}</div>
              </div>
            ))}
          </div>
          <p>
            Confusion matrices are also generated to show how often the model confuses one infrastructure category
            with another. All metrics are computed on the held-out test set only.
          </p>
        </div>
      </Section>

      {/* Limitations */}
      <Section id="limitations" icon={AlertTriangle} title="Limitations & Ethical Considerations">
        <div className="space-y-4 text-navy-300 text-sm leading-relaxed">
          <div className="space-y-2">
            {[
              {
                title: 'Synthetic Data',
                desc: 'All data was generated algorithmically. Performance metrics reflect synthetic dataset characteristics only, not real-world accuracy.',
              },
              {
                title: 'Infrastructure ≠ Safety',
                desc: 'Infrastructure quality is only one factor. Time of day, foot traffic, social context, and many other variables affect personal safety.',
              },
              {
                title: 'Representation Bias',
                desc: 'A model trained on data from one location may not generalize to other locations with different infrastructure standards.',
              },
              {
                title: 'No Crime Prediction',
                desc: 'This project does not model or predict criminal behavior. Using a safety tool to predict crime would be ethically problematic and scientifically invalid.',
              },
              {
                title: 'Data Freshness',
                desc: 'Infrastructure changes over time. A dataset that is even one year old may not accurately reflect current conditions.',
              },
              {
                title: 'Consent and Privacy',
                desc: 'Any future system collecting real location or route data must obtain informed consent and protect user privacy.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-navy-800 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">{title}</div>
                  <div className="text-navy-400 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Future work */}
      <Section id="future" icon={ChevronRight} title="Future Improvements">
        <ul className="space-y-2 text-navy-300 text-sm">
          {[
            'Collect verified, community-reviewed infrastructure data from real locations (with consent).',
            'Expand the feature set to include footpath width, tree cover, building density, and time-of-day variables.',
            'Use geospatial data from open sources (e.g., OpenStreetMap) to automatically calculate feature scores.',
            'Apply cross-validation to get more reliable performance estimates on small datasets.',
            'Test with more advanced models (gradient boosting, neural networks) as dataset size increases.',
            'Integrate community feedback mechanisms to allow residents to flag incorrect data.',
            'Collaborate with urban planners and local authorities to co-design data collection protocols.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
