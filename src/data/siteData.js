// src/data/siteData.js

/**
 * Centralized website data.
 *
 * Exports:
 * - SITE_DATA
 * - CATEGORIES_OVERVIEW
 * - UI
 *
 * Only Probability and Statistics (st1) has a compiled Quarto HTML page.
 * Other publications remain in progress until their HTML files are ready.
 */

// ------------------------------------------------------------
// Shared UI styles
// ------------------------------------------------------------

export const UI = {
  focusRing:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
};

// ------------------------------------------------------------
// Category overview
// ------------------------------------------------------------

export const CATEGORIES_OVERVIEW = [
  {
    id: 'pure-math',
    name: 'Pure Math',
    title: 'Pure Math',
    description:
      'Analysis, abstract structures, and the mathematical foundations of rigorous reasoning.',
    items: [
      'Real & Complex Analysis',
      'Functional Analysis',
      'Measure Theory',
    ],
  },
  {
    id: 'applied-math',
    name: 'Applied Math',
    title: 'Applied Math',
    description:
      'Differential equations, mathematical modelling, and analytical methods.',
    items: [
      'Differential Equations',
      'Partial Differential Equations',
      'Mathematical Finance (Black-Scholes & Analytical Derivations)',
    ],
  },
  {
    id: 'statistics',
    name: 'Statistics',
    title: 'Statistics',
    description:
      'Probability, statistical inference, stochastic modelling, and data analysis.',
    items: [
      'Probability and Statistics',
      'Mathematical Statistics',
      'Computational Statistics',
      'Linear Regression',
      'Stochastic Processes II',
      'Bayesian Statistics',
      'Time Series Analysis',
      'Statistical Learning',
      'Causal Inference',
      'Generalized Linear Models',
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    title: 'Computer Science',
    description:
      'Programming, algorithms, numerical computation, and machine learning.',
    items: [
      'Data Structures',
      'Object-Oriented Programming',
      'Numerical Analysis',
      'Computational PDEs',
      'Data Mining & Machine Learning',
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    title: 'Optimization',
    description:
      'Optimization theory, convexity, and mathematical decision-making.',
    items: ['Convex Optimization'],
  },
];

// ------------------------------------------------------------
// Publication records
// ------------------------------------------------------------

const publications = [
  // ==========================================================
  // PURE MATH
  // ==========================================================

  {
    id: 'pm1',
    title: 'Real & Complex Analysis',
    category: 'Pure Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Comprehensive lecture notes and problem explorations covering metric spaces, convergence, Lebesgue integration, and holomorphic functions.',
    abstract:
      'A rigorous academic transcript covering the foundations of real and complex analysis, including metric spaces, sequences and series, integration, and complex differentiability.',
    onThisPage: [],
  },

  {
    id: 'pm2',
    title: 'Functional Analysis',
    category: 'Pure Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Lecture notes on normed spaces, Banach and Hilbert spaces, bounded operators, and fundamental theorems.',
    abstract:
      'An organized study of functional analysis, emphasizing normed linear spaces, completeness, continuous linear operators, dual spaces, and central results in infinite-dimensional analysis.',
    onThisPage: [],
  },

  {
    id: 'pm3',
    title: 'Measure Theory',
    category: 'Pure Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Structured notes on sigma-algebras, measurable functions, measures, integration, and convergence theorems.',
    abstract:
      'A systematic introduction to measure theory and its role in modern analysis, covering measurable spaces, measure construction, Lebesgue integration, and convergence results.',
    onThisPage: [],
  },

  // ==========================================================
  // APPLIED MATH
  // ==========================================================

  {
    id: 'am1',
    title: 'Differential Equations',
    category: 'Applied Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Lecture notes on ordinary differential equations, existence and uniqueness, solution methods, and dynamical systems.',
    abstract:
      'An academic reference to ordinary differential equations, including analytical solution techniques, initial-value problems, qualitative behaviour, and applications to mathematical modelling.',
    onThisPage: [],
  },

  {
    id: 'am2',
    title: 'Partial Differential Equations',
    category: 'Applied Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Notes on elliptic, parabolic, and hyperbolic equations, boundary conditions, and analytical solution methods.',
    abstract:
      'A structured treatment of partial differential equations, emphasizing classification, boundary-value problems, classical solution methods, and applications in mathematical physics.',
    onThisPage: [],
  },

  {
    id: 'am3',
    title:
      'Mathematical Finance (Black-Scholes & Analytical Derivations)',
    category: 'Applied Math',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Derivations and lecture notes on financial modelling, stochastic assumptions, option pricing, and the Black-Scholes equation.',
    abstract:
      'An analytical exploration of mathematical finance, focusing on the assumptions and derivation of the Black-Scholes framework, option pricing, and the relationship between stochastic models and partial differential equations.',
    onThisPage: [],
  },

  // ==========================================================
  // STATISTICS
  // ==========================================================

  {
    id: 'st1',
    title: 'Probability and Statistics',
    category: 'Statistics',
    date: 'NOV 12, 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: '31 PAGES',
    status: 'published',
    htmlUrl: '/notes/probability.html',
    summary:
      'A comprehensive set of academic notes covering probability spaces, random variables, distributions, and statistical inference.',
    abstract:
      'This document serves as a comprehensive academic transcript covering foundational probability spaces, random variables, and the mechanics of statistical inference.',
    // Keep the outline labels in sync with the headings in probability.html.
    // The supplied list does not specify each heading's H1/H2 nesting, so keep
    // these as a flat outline instead of inventing a hierarchy.
    onThisPage: [
      {
        id: 'univariate-discrete-probability-distribution',
        anchorId: 'univariate-discrete-probability-distribution',
        title: 'Univariate Discrete Probability Distribution',
      },
      {
        id: 'expectation-of-random-variable',
        anchorId: 'expectation-of-random-variable',
        title: 'Expectation of Random Variable',
      },
      {
        id: 'moment-generating-function',
        anchorId: 'moment-generating-function',
        title: 'Moment Generating Function',
      },
      {
        id: 'special-discrete-probability-distribution',
        anchorId: 'special-discrete-probability-distribution',
        title: 'Special Discrete Probability Distribution',
      },
      {
        id: 'expectation-covariance-correlation',
        anchorId: 'expectation-covariance-correlation',
        title: 'Expectation, Covariance, Correlation',
      },
      {
        id: 'linear-combination-of-random-variables',
        anchorId: 'linear-combination-of-random-variables',
        title: 'Linear Combination of Random Variables',
      },
      {
        id: 'conditional-probability-distribution',
        anchorId: 'conditional-probability-distribution',
        title: 'Conditional Probability Distribution',
      },
      {
        id: 'law-of-total-expectation',
        anchorId: 'law-of-total-expectation',
        title: 'Law of Total Expectation',
      },
      {
        id: 'univariate-continuous-probability-distribution',
        anchorId: 'univariate-continuous-probability-distribution',
        title: 'Univariate Continuous Probability Distribution',
      },
      {
        id: 'central-limit-theorem-clt',
        anchorId: 'central-limit-theorem-clt',
        title: 'Central Limit Theorem (CLT)',
      },
      {
        id: 'introduction-to-statistical-science',
        anchorId: 'introduction-to-statistical-science',
        title: 'Introduction to Statistical Science',
      },
      {
        id: 'estimation-theory',
        anchorId: 'estimation-theory',
        title: 'Estimation Theory',
      },
    ],
  },

  {
    id: 'st2',
    title: 'Mathematical Statistics',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Mathematical foundations of statistical inference, including estimators, likelihood, sufficiency, and hypothesis testing.',
    abstract:
      'A mathematically focused treatment of statistical inference, covering sampling distributions, estimation theory, likelihood methods, confidence intervals, and hypothesis testing.',
    onThisPage: [],
  },

  {
    id: 'st3',
    title: 'Computational Statistics',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Computational methods for statistical analysis, simulation, resampling, and numerical inference.',
    abstract:
      'A collection of notes on computational statistical methods, including Monte Carlo simulation, bootstrap procedures, numerical optimization, and computational approaches to inference.',
    onThisPage: [],
  },

  {
    id: 'st4',
    title: 'Linear Regression',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Theory and applications of linear models, least-squares estimation, model diagnostics, and inference.',
    abstract:
      'A structured introduction to linear regression, including model assumptions, least-squares estimation, matrix formulations, statistical inference, diagnostics, and model interpretation.',
    onThisPage: [],
  },

  {
    id: 'st5',
    title: 'Stochastic Processes II',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Advanced notes on stochastic processes, transition structures, limiting behaviour, and probabilistic models.',
    abstract:
      'An advanced study of stochastic processes, emphasizing probabilistic structure, transition behaviour, long-run properties, and applications to stochastic modelling.',
    onThisPage: [],
  },

  {
    id: 'st6',
    title: 'Bayesian Statistics',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Bayesian inference, prior distributions, posterior computation, predictive distributions, and model comparison.',
    abstract:
      'A systematic treatment of Bayesian statistics, including prior specification, posterior inference, conjugate models, predictive distributions, computational techniques, and Bayesian model assessment.',
    onThisPage: [],
  },

  {
    id: 'st7',
    title: 'Time Series Analysis',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Time-dependent data, stationarity, autocorrelation, ARIMA models, forecasting, and model diagnostics.',
    abstract:
      'A collection of notes on time series analysis, covering dependence over time, stationarity, autocorrelation, classical time series models, forecasting, and diagnostic methods.',
    onThisPage: [],
  },

  {
    id: 'st8',
    title: 'Statistical Learning',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Statistical learning methods covering prediction, regularization, model selection, and generalization.',
    abstract:
      'An organized study of statistical learning, including supervised learning, predictive modelling, regularization, cross-validation, model selection, and the bias-variance trade-off.',
    onThisPage: [],
  },

  {
    id: 'st9',
    title: 'Causal Inference',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Causal reasoning, potential outcomes, directed acyclic graphs, identification, and treatment-effect estimation.',
    abstract:
      'A structured introduction to causal inference, covering causal estimands, potential outcomes, graphical causal models, confounding, identification assumptions, and treatment-effect estimation.',
    onThisPage: [],
  },

  {
    id: 'st10',
    title: 'Generalized Linear Models',
    category: 'Statistics',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Generalized linear model theory, link functions, exponential-family distributions, estimation, and diagnostics.',
    abstract:
      'A comprehensive introduction to generalized linear models, including exponential-family distributions, link functions, maximum-likelihood estimation, inference, and model diagnostics.',
    onThisPage: [],
  },

  // ==========================================================
  // COMPUTER SCIENCE
  // ==========================================================

  {
    id: 'cs1',
    title: 'Data Structures',
    category: 'Computer Science',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Core data structures, algorithmic complexity, trees, graphs, hashing, and implementation trade-offs.',
    abstract:
      'An organized reference to fundamental data structures and algorithms, including complexity analysis, linked structures, trees, graph representations, hashing, and practical implementation considerations.',
    onThisPage: [],
  },

  {
    id: 'cs2',
    title: 'Object-Oriented Programming',
    category: 'Computer Science',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Object-oriented programming concepts, encapsulation, inheritance, polymorphism, interfaces, and software design.',
    abstract:
      'A structured set of notes on object-oriented programming, covering classes, objects, encapsulation, inheritance, polymorphism, interfaces, and maintainable software design.',
    onThisPage: [],
  },

  {
    id: 'cs3',
    title: 'Numerical Analysis',
    category: 'Computer Science',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Numerical algorithms for root finding, interpolation, approximation, numerical integration, and error analysis.',
    abstract:
      'A mathematical and computational treatment of numerical analysis, emphasizing numerical stability, error bounds, root-finding algorithms, interpolation, approximation, and numerical integration.',
    onThisPage: [],
  },

  {
    id: 'cs4',
    title: 'Computational PDEs',
    category: 'Computer Science',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Computational methods for partial differential equations, including finite differences, discretization, and stability.',
    abstract:
      'A collection of notes on numerical methods for partial differential equations, covering discretization, finite-difference schemes, stability, convergence, and computational implementation.',
    onThisPage: [],
  },

  {
    id: 'cs5',
    title: 'Data Mining & Machine Learning',
    category: 'Computer Science',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Data processing, feature engineering, classification, clustering, model evaluation, and machine-learning workflows.',
    abstract:
      'A structured overview of data mining and machine learning, including data preparation, feature representation, supervised and unsupervised methods, evaluation metrics, and practical modelling workflows.',
    onThisPage: [],
  },

  // ==========================================================
  // OPTIMIZATION
  // ==========================================================

  {
    id: 'op1',
    title: 'Convex Optimization',
    category: 'Optimization',
    date: 'OCT 2026',
    lastEdited: 'OCT 15, 2026',
    readingTime: 'IN PROGRESS',
    status: 'draft',
    summary:
      'Convex sets and functions, optimality conditions, duality, constrained optimization, and algorithmic methods.',
    abstract:
      'A mathematically rigorous introduction to convex optimization, including convex sets, convex functions, optimality conditions, Lagrangian duality, constrained problems, and numerical optimization methods.',
    onThisPage: [],
  },
];

// ------------------------------------------------------------
// Main site data
// ------------------------------------------------------------

export const SITE_DATA = {
  // Data used by AboutPage.jsx.
  // Update the copy below to match your preferred personal introduction.
  profile: {
    domain: 'COMPUTER SCIENCE & STATISTICS ',
    bio: [
      'I am currently studying Computer Science and Statistics at the University of Waterloo, with a strong interest in quantitative research. My primary research interests include statistical inference, stochastic calculus, statistical learning, and machine learning. These fields provide me with the mathematical tools to study uncertainty, while financial markets pose a deeper challenge: do patterns that hold in historical data reveal underlying market mechanisms, or do they merely capture coincidences specific to a particular environment? Even if a model can accurately explain the past, how can we determine whether its insights will remain valid in the future? To me, truly valuable research lies not only in discovering patterns, but also in understanding the conditions under which they hold, the limits of their applicability, and the circumstances in which they may fail.',
      'Whenever I consider flipping a coin to make a decision, I am reminded that the outcome need not be heads or tails alone; the coin could also land on its edge. Beyond the binary frameworks we instinctively rely on, there are possibilities we overlook. Even if such an outcome is extraordinarily unlikely, its mere existence reminds me to return to the reality those frameworks attempt to describe: the world is never as simple as the models we construct to represent it. Financial markets are no different. Behind every probability distribution, every modeling assumption, and every predictive model lies a world far more complex than its mathematical representation can capture.',
      'What fascinates me about mathematics is its ability to transform complex problems into clear structures through rigorous reasoning, ultimately offering a sense of certainty through proof. I am drawn to certainty and unsettled by the unknown, by missing information, and by situations in which no clear judgment seems possible. I often wonder whether it is possible to construct a sufficiently precise model to genuinely predict the movements of financial markets. Pushing this idea to its logical extreme leads me to a deeper question: could the universe itself be one enormous deterministic process, with what we call randomness arising merely from the limitations of our knowledge and computational capabilities? Regardless of whether this speculation is ultimately correct, there are times when I wish I could pretend never to have considered the possibility and simply continue living as I did before.',
      'If I were ever to discover a model capable of predicting the future with absolute certainty, I would not confine its applications to financial markets. I would seek to use it to understand the evolution of economies, societies, and even natural systems. Such a discovery would reveal more than a means of generating excess returns; it might offer a glimpse into the deeper principles governing how the world works.',
      'I have come to believe that there is only one genuinely valuable kind of success philosophy: to study historical events, extract their underlying patterns, and recursively apply those insights to new and changing circumstances. To me, this is what Quant is fundamentally about. A model learns from history, but it cannot stop at explaining the past; it must be tested against new data and reality, then refined through the discrepancies between its predictions and actual outcomes. I see quantitative research as precisely this kind of recursive process: finding clues in the past, testing hypotheses in the present, and applying an evolving understanding to the future. Perhaps what we seek is not merely Alpha, but the ability to discern, amid constantly changing phenomena, the patterns truly worth believing in—those that can withstand the test of time.'
    ],
    edition: '2026',
    researchAreas: [
      {
        id: 'probability-statistics',
        index: '01',
        title: 'Probability & Statistics',
        description:
          'Probability spaces, random variables, statistical inference, stochastic models, and the mathematical foundations of data analysis.'
      },
      {
        id: 'mathematical-analysis',
        index: '02',
        title: 'Mathematical Analysis',
        description:
          'Real and complex analysis, measure theory, functional analysis, and the rigorous study of convergence and mathematical structures.'
      },
      {
        id: 'computation-optimization',
        index: '03',
        title: 'Computation & Optimization',
        description:
          'Numerical analysis, computational methods for differential equations, machine learning, and optimization theory.'
      }
    ],
    // Add your real contact details here when you are ready to display them.
    contacts: []
  },

  // Keep the existing publication list available to Archive/Notes pages.
  publications,
};

// Optional named export for components that prefer direct access.
export { publications };

// Default export for compatibility with default-import usage.
export default SITE_DATA;