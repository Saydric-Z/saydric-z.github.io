import { useState } from 'react';
import { ArrowUpRight, ChevronDown, FileText } from 'lucide-react';
import { UI } from '../data/siteData';

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

/**
 * Starter content only. Replace the illustrative research briefs, statuses,
 * implementation notes and results with verified project details before
 * presenting these entries as real work. Public artifacts are intentionally
 * empty until actual repository/report URLs are supplied.
 */
const STARTER_PROJECTS = [
  {
    id: 'quantitative-backtesting-framework',
    number: '001',
    title: 'Quantitative Backtesting Framework',
    status: 'In Progress',
    technologies: ['Python', 'Statistical Modeling', 'Time Series'],
    summary:
      'A research-oriented framework concept for testing systematic strategies with reproducible data handling, execution assumptions, and out-of-sample evaluation.',
    researchQuestion:
      'How can a backtesting workflow reduce look-ahead bias and unrealistic execution assumptions while making strategy comparisons reproducible?',
    methodology:
      'Define timestamp-safe data access, chronological train/validation/test splits, benchmark strategies, transaction-cost assumptions, and risk-adjusted evaluation criteria.',
    implementation:
      'Potential modules include data ingestion, signal interfaces, portfolio accounting, transaction-cost modeling, performance reporting, and validation checks. Replace this outline with the modules actually implemented.',
    experimentsAndResults:
      'Results have not been supplied yet. Once experiments are run, report the dataset and date range, baseline comparison, fee/slippage assumptions, and relevant return and risk statistics.',
    limitations:
      'Backtest results can be distorted by survivorship bias, look-ahead bias, data snooping, market impact, regime changes, and assumptions that do not hold in live trading.',
    artifacts: [],
  },
  {
    id: 'statistical-model-evaluation',
    number: '002',
    title: 'Statistical Model Evaluation',
    status: 'Research',
    technologies: ['Probability', 'Statistical Inference', 'Simulation'],
    summary:
      'A study template for evaluating model assumptions and finite-sample behavior through simulation and carefully specified statistical comparisons.',
    researchQuestion:
      'Under which data-generating conditions does an estimator or predictive model remain calibrated, stable, and statistically reliable?',
    methodology:
      'Specify data-generating processes, derive or state evaluation criteria, run repeated simulations, and compare estimators across sample sizes and assumption violations.',
    implementation:
      'A reproducible implementation could separate simulation design, estimator interfaces, metrics, experiment configuration, and plotting. Document the actual code structure once it exists.',
    experimentsAndResults:
      'No empirical or simulation results are claimed in this starter entry. Add the number of replications, random-seed policy, uncertainty estimates, and observed findings after running the experiments.',
    limitations:
      'Simulation conclusions depend on the selected data-generating processes and parameter ranges; they do not automatically generalize to every real dataset or market regime.',
    artifacts: [],
  },
];

const DETAIL_SECTIONS = [
  { key: 'researchQuestion', label: 'Research Question' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'implementation', label: 'Implementation' },
  { key: 'experimentsAndResults', label: 'Experiments & Results' },
  { key: 'limitations', label: 'Limitations' },
];

function StatusLabel({ status }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-neutral-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      {status}
    </span>
  );
}

function ArtifactList({ artifacts = [] }) {
  const validArtifacts = artifacts.filter((artifact) => artifact?.href && artifact?.label);

  if (validArtifacts.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        No public repository or report linked yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {validArtifacts.map((artifact) => (
        <a
          key={`${artifact.label}-${artifact.href}`}
          href={artifact.href}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 text-sm text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 dark:text-neutral-300 dark:decoration-neutral-700 dark:hover:text-white ${FOCUS_RING}`}
        >
          {artifact.label}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export default function ProjectsPage({ projects = STARTER_PROJECTS }) {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const entries = Array.isArray(projects) ? projects : [];

  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="space-y-10 md:space-y-12">
        <header className="max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
            Research &amp; Implementation
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-neutral-50">
            Projects
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Research questions, modeling choices, implementation notes, and experimental evidence — documented with an emphasis on reproducibility and limitations.
          </p>
          <p className="mt-4 border-l border-neutral-300 pl-3 text-xs leading-relaxed text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Starter examples are provided as structure only. Replace their descriptions, statuses, results, and links with verified project information before treating them as a portfolio of completed work.
          </p>
        </header>

        <section aria-label="Research projects" className="border-t border-neutral-200 dark:border-neutral-800">
          {entries.length === 0 ? (
            <p className="border-b border-neutral-200 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              No projects have been published yet.
            </p>
          ) : (
            entries.map((project, index) => {
              const number = project?.number ?? String(index + 1).padStart(3, '0');
              const projectKey = project?.id ?? project?.title ?? index;
              const isExpanded = expandedProjectId === projectKey;
              const detailsId = `project-details-${projectKey}`;

              return (
                <article key={projectKey} className="border-b border-neutral-200 dark:border-neutral-800">
                  <div className="grid grid-cols-1 gap-4 py-7 sm:py-8 md:grid-cols-[90px_minmax(0,1fr)] md:gap-7 lg:gap-10">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      PROJECT / {number}
                    </p>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                          {project?.title ?? 'Untitled project'}
                        </h2>
                        {project?.status && <StatusLabel status={project.status} />}
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base dark:text-neutral-400">
                        {project?.summary ?? ''}
                      </p>

                      {Array.isArray(project?.technologies) && project.technologies.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2" aria-label="Technologies">
                          {project.technologies.map((technology) => (
                            <li key={technology} className="border border-neutral-200 px-2 py-1 font-mono text-[10px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                              {technology}
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={() => setExpandedProjectId(isExpanded ? null : projectKey)}
                        className={`mt-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:decoration-neutral-700 dark:hover:text-white ${FOCUS_RING}`}
                      >
                        <span>{isExpanded ? 'Hide project details' : 'Explore project details'}</span>
                        <ChevronDown className={`h-4 w-4 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>

                      {isExpanded && (
                        <div id={detailsId} className="mt-7 space-y-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                            {DETAIL_SECTIONS.map(({ key, label }) => (
                              <div key={key} className="min-w-0">
                                <dt className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                                  {label}
                                </dt>
                                <dd className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                  {project?.[key] || 'To be documented.'}
                                </dd>
                              </div>
                            ))}

                            <div className="min-w-0">
                              <dt className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                Artifacts
                              </dt>
                              <dd>
                                <ArtifactList artifacts={project?.artifacts} />
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Selected work · Research, modeling, and reproducible computation
        </p>
      </div>
    </main>
  );
}
