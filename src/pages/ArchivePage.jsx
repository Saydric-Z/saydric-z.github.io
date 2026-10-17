// src/pages/ArchivePage.jsx

import { useMemo, useState } from 'react';
import { ArrowRight, FileText, Clock } from 'lucide-react';

import {
  SITE_DATA,
  CATEGORIES_OVERVIEW,
  UI,
} from '../data/siteData';

// ============================================================
// Constants
// ============================================================

const DISCIPLINE_ORDER = [
  'Pure Math',
  'Applied Math',
  'Statistics',
  'Computer Science',
  'Optimization',
];

const MONTHS = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400';

// ============================================================
// Date helpers
// ============================================================

/**
 * Parse dates from siteData.js, including:
 * OCT 15, 2026
 * NOV 12, 2026
 * OCT 2026
 * 2026-10-15
 * ISO date-time strings
 *
 * Returns a timestamp or null for an invalid date.
 */
function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    const timestamp = value.getTime();

    return Number.isFinite(timestamp)
      ? timestamp
      : null;
  }

  const text = String(value).trim();

  if (!text) return null;

  // Explicitly parse abbreviated English month formats.
  const normalized = text
    .toUpperCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const monthMatch = normalized.match(
    /^([A-Z]{3})\s+(?:(\d{1,2})\s+)?(\d{4})$/,
  );

  if (monthMatch) {
    const month = MONTHS[monthMatch[1]];
    const day = monthMatch[2]
      ? Number(monthMatch[2])
      : 1;
    const year = Number(monthMatch[3]);

    if (
      month === undefined ||
      !Number.isInteger(year) ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const parsedDate = new Date(
      Date.UTC(year, month, day),
    );

    // Reject invalid dates instead of silently normalizing them.
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      return null;
    }

    return parsedDate.getTime();
  }

  // Fall back to ISO and other standard browser-supported formats.
  const timestamp = Date.parse(text);

  return Number.isFinite(timestamp)
    ? timestamp
    : null;
}

/**
 * Use lastEdited first, then fall back to date.
 */
function getRevisionTimestamp(publication) {
  return (
    parseDate(publication?.lastEdited) ??
    parseDate(publication?.date) ??
    0
  );
}

/**
 * Display whichever valid revision date is being used.
 */
function getRevisionLabel(publication) {
  if (parseDate(publication?.lastEdited) !== null) {
    return publication.lastEdited;
  }

  if (parseDate(publication?.date) !== null) {
    return publication.date;
  }

  return null;
}

function normalizeCategory(category) {
  return String(category || '')
    .trim()
    .toLowerCase();
}

function getDisciplineIndex(category) {
  const index = DISCIPLINE_ORDER.findIndex(
    (discipline) =>
      normalizeCategory(discipline) ===
      normalizeCategory(category),
  );

  // Unknown categories appear after the five main disciplines.
  return index === -1 ? 99 : index;
}

// ============================================================
// ArchivePage
// ============================================================

export default function ArchivePage({
  onNavigate,
  onSelectNote,
}) {
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  // recent | category
  const [sortBy, setSortBy] = useState('recent');

  // ----------------------------------------------------------
  // Source data
  // ----------------------------------------------------------

  const publications = useMemo(
    () =>
      Array.isArray(SITE_DATA?.publications)
        ? SITE_DATA.publications
        : [],
    [],
  );

  const categories = useMemo(
    () =>
      Array.isArray(CATEGORIES_OVERVIEW)
        ? CATEGORIES_OVERVIEW
        : [],
    [],
  );

  // ----------------------------------------------------------
  // Latest revision date across the entire archive
  // ----------------------------------------------------------

  const latestRevisionDate = useMemo(() => {
    const datedPublications = publications
      .map((publication, originalIndex) => ({
        publication,
        originalIndex,
        timestamp: getRevisionTimestamp(publication),
        label: getRevisionLabel(publication),
      }))
      .filter(
        (item) =>
          item.label !== null &&
          item.timestamp > 0,
      );

    if (datedPublications.length === 0) {
      return 'No revision date';
    }

    datedPublications.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return b.timestamp - a.timestamp;
      }

      return a.originalIndex - b.originalIndex;
    });

    return datedPublications[0].label;
  }, [publications]);

  // ----------------------------------------------------------
  // Category filtering followed by sorting
  // ----------------------------------------------------------

  const processedPublications = useMemo(() => {
    // Step 1: filter by the selected category.
    const list =
      normalizeCategory(selectedCategory) === 'all'
        ? [...publications]
        : publications.filter(
            (item) =>
              normalizeCategory(item?.category) ===
              normalizeCategory(selectedCategory),
          );

    // Step 2: apply the selected sorting mode.
    list.sort((a, b) => {
      const dateA = getRevisionTimestamp(a);
      const dateB = getRevisionTimestamp(b);

      if (sortBy === 'category') {
        // First: order by the five academic disciplines.
        const orderA = getDisciplineIndex(a?.category);
        const orderB = getDisciplineIndex(b?.category);

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        // Second: sort within each discipline by revision date.
        if (dateA !== dateB) {
          return dateB - dateA;
        }

        // Third: use publication date as a tie-breaker.
        const publicationDateA =
          parseDate(a?.date) ?? 0;

        const publicationDateB =
          parseDate(b?.date) ?? 0;

        return publicationDateB - publicationDateA;
      }

      // Recently Revised: newest revisions first.
      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // For equal revision dates, prefer newer publication dates.
      const publicationDateA =
        parseDate(a?.date) ?? 0;

      const publicationDateB =
        parseDate(b?.date) ?? 0;

      return publicationDateB - publicationDateA;
    });

    return list;
  }, [publications, selectedCategory, sortBy]);

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const openPublication = (publication) => {
    if (!publication) return;

    // Preferred selection callback used by App.jsx.
    if (typeof onSelectNote === 'function') {
      onSelectNote(publication);
      return;
    }

    // Compatibility with callers using the navigation handler.
    if (typeof onNavigate === 'function') {
      onNavigate('detail', publication);
    }
  };

  // ----------------------------------------------------------
  // Segmented toggle styles
  // ----------------------------------------------------------

  const getSortButtonClass = (isActive) =>
    [
      'cursor-pointer rounded-md px-2.5 py-1',
      'font-mono text-[11px] transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
      isActive
        ? 'bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
    ].join(' ');

  // ----------------------------------------------------------
  // Page
  // ----------------------------------------------------------

  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="space-y-10 md:space-y-12">

        {/* ====================================================
            Page heading
            ==================================================== */}

        <section>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
            Knowledge Repository
          </p>

          <h1 className="font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-neutral-50">
            Academic Archive
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Browse notes across pure mathematics, applied mathematics,
            statistics, computer science, and optimization.
          </p>
        </section>

        {/* ====================================================
            Category filters
            ==================================================== */}

        <section aria-label="Filter publications by category">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Browse by discipline
            </h2>

            <span className="font-mono text-xs text-neutral-400">
              {categories.length} CATEGORIES
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All categories */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              aria-pressed={
                normalizeCategory(selectedCategory) === 'all'
              }
              className={`
                cursor-pointer rounded-full border px-4 py-2 text-sm font-medium
                transition-colors duration-200
                ${
                  normalizeCategory(selectedCategory) === 'all'
                    ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:bg-transparent dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white'
                }
                ${FOCUS_RING}
              `}
            >
              All
            </button>

            {categories.map((cat, index) => {
              const isSelected =
                normalizeCategory(selectedCategory) ===
                normalizeCategory(cat.name);

              return (
                <button
                  key={cat.id || cat.name || index}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  aria-pressed={isSelected}
                  className={`
                    cursor-pointer rounded-full border px-4 py-2 text-sm font-medium
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:bg-transparent dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white'
                    }
                    ${FOCUS_RING}
                  `}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            Result count, revision date, and sorting controls
            ==================================================== */}

        <section>
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              SHOWING {processedPublications.length} RECORDS
            </h2>

            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-400">
              {/* Latest revision indicator: Clock is actively used */}
              <span className="inline-flex items-center gap-1.5">
                <Clock
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Latest Revision: {latestRevisionDate}
                </span>

                <span className="sm:hidden">
                  Rev. {latestRevisionDate}
                </span>
              </span>

              <span
                className="hidden text-neutral-200 dark:text-neutral-800 sm:inline"
                aria-hidden="true"
              >
                /
              </span>

              {/* Segmented sorting toggle */}
              <div
                role="group"
                aria-label="Sort publications"
                className="flex items-center gap-1 rounded-lg border border-neutral-200/60 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900/60"
              >
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  aria-pressed={sortBy === 'recent'}
                  className={getSortButtonClass(
                    sortBy === 'recent',
                  )}
                >
                  Recently Revised
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy('category')}
                  aria-pressed={sortBy === 'category'}
                  className={getSortButtonClass(
                    sortBy === 'category',
                  )}
                >
                  By Discipline
                </button>
              </div>

              {normalizeCategory(selectedCategory) !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`cursor-pointer text-xs text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white ${FOCUS_RING}`}
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              Publication list
              ================================================== */}

          {processedPublications.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {processedPublications.map((publication, index) => (
                <button
                  key={publication?.id ?? index}
                  type="button"
                  onClick={() => openPublication(publication)}
                  aria-label={`Open ${publication?.title || 'Untitled Note'}`}
                  className={`
                    group grid w-full cursor-pointer grid-cols-1 gap-4 py-6
                    text-left transition-colors duration-200
                    hover:bg-neutral-50/70 sm:py-7
                    md:grid-cols-[minmax(0,1fr)_auto]
                    md:items-center md:gap-8
                    dark:hover:bg-white/[0.025]
                    ${FOCUS_RING}
                  `}
                >
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                        {publication?.category ?? 'Uncategorized'}
                      </span>

                      <span
                        className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700"
                        aria-hidden="true"
                      />

                      <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                        {publication?.date ?? 'Undated'}
                      </span>

                      {publication?.lastEdited &&
                        publication.lastEdited !== publication.date && (
                          <>
                            <span
                              className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700"
                              aria-hidden="true"
                            />

                            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                              Updated {publication.lastEdited}
                            </span>
                          </>
                        )}

                      {/* Publication status */}
                      {publication?.htmlUrl ? (
                        <span className="rounded-full border border-neutral-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full border border-neutral-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-2xl dark:text-neutral-100 dark:group-hover:text-neutral-300">
                      {publication?.title ?? 'Untitled Note'}
                    </h3>

                    {(publication?.summary ||
                      publication?.abstract) && (
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base dark:text-neutral-400">
                        {publication.summary ||
                          publication.abstract}
                      </p>
                    )}

                    {publication?.readingTime && (
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                        {publication.readingTime}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 text-neutral-400 transition-colors group-hover:text-neutral-900 md:justify-end dark:group-hover:text-white">
                    <span className="inline-flex items-center gap-2 text-xs md:hidden">
                      <FileText
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      View note
                    </span>

                    <ArrowRight
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <FileText className="mx-auto mb-4 h-7 w-7 text-neutral-300 dark:text-neutral-700" />

              <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100">
                No notes in this category yet
              </h3>

              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Try another discipline or view the full archive.
              </p>

              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`mt-5 cursor-pointer text-sm underline underline-offset-4 ${FOCUS_RING}`}
              >
                Show all records
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}