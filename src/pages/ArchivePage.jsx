// src/pages/ArchivePage.jsx

import { useMemo, useState } from 'react';
import { SITE_DATA, CATEGORIES_OVERVIEW } from '../data/siteData';

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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf9]';

const FALLBACK_CATEGORIES = DISCIPLINE_ORDER.map((name) => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
}));

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
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  const text = String(value).trim();
  if (!text) return null;

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
    const day = monthMatch[2] ? Number(monthMatch[2]) : 1;
    const year = Number(monthMatch[3]);

    if (
      month === undefined ||
      !Number.isInteger(year) ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const parsedDate = new Date(Date.UTC(year, month, day));

    // Reject invalid calendar dates instead of silently normalizing them.
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
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getRevisionTimestamp(publication) {
  return (
    parseDate(publication?.lastEdited) ??
    parseDate(publication?.date) ??
    0
  );
}

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
  return String(category || '').trim().toLowerCase();
}

function getDisciplineIndex(category) {
  const index = DISCIPLINE_ORDER.findIndex(
    (discipline) =>
      normalizeCategory(discipline) === normalizeCategory(category),
  );

  // Unknown categories appear after the five main disciplines.
  return index === -1 ? 99 : index;
}

function getPublicationTimestamp(publication) {
  return parseDate(publication?.date) ?? 0;
}

function isPublicationPublished(publication) {
  return Boolean(
    publication?.htmlUrl || publication?.status === 'published',
  );
}

// ============================================================
// ArchivePage
// ============================================================

export default function ArchivePage({ onNavigate, onSelectNote }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // recent | category

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

  const categories = useMemo(() => {
    const source = Array.isArray(CATEGORIES_OVERVIEW)
      ? CATEGORIES_OVERVIEW
      : [];

    const validCategories = source
      .map((category) => ({
        id: category?.id ?? category?.name ?? category?.title,
        name: category?.name ?? category?.title,
      }))
      .filter((category) => Boolean(category.name));

    return validCategories.length > 0
      ? validCategories
      : FALLBACK_CATEGORIES;
  }, []);

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
      .filter((item) => item.label !== null && item.timestamp > 0);

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
    const list =
      normalizeCategory(selectedCategory) === 'all'
        ? [...publications]
        : publications.filter(
            (item) =>
              normalizeCategory(item?.category) ===
              normalizeCategory(selectedCategory),
          );

    list.sort((a, b) => {
      const dateA = getRevisionTimestamp(a);
      const dateB = getRevisionTimestamp(b);
      const publicationDateA = getPublicationTimestamp(a);
      const publicationDateB = getPublicationTimestamp(b);

      if (sortBy === 'category') {
        const orderA = getDisciplineIndex(a?.category);
        const orderB = getDisciplineIndex(b?.category);

        if (orderA !== orderB) return orderA - orderB;
        if (dateA !== dateB) return dateB - dateA;
        if (publicationDateA !== publicationDateB) {
          return publicationDateB - publicationDateA;
        }
        return String(a?.title ?? '').localeCompare(String(b?.title ?? ''));
      }

      if (dateA !== dateB) return dateB - dateA;
      if (publicationDateA !== publicationDateB) {
        return publicationDateB - publicationDateA;
      }
      return String(a?.title ?? '').localeCompare(String(b?.title ?? ''));
    });

    return list;
  }, [publications, selectedCategory, sortBy]);

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const openPublication = (publication) => {
    if (!publication) return;

    if (typeof onSelectNote === 'function') {
      onSelectNote(publication);
      return;
    }

    // Backwards-compatible fallback for callers that expose route navigation.
    if (typeof onNavigate === 'function') {
      onNavigate('detail', publication);
      return;
    }

    // If this component is used without the SPA handlers, open a published
    // HTML note directly when a destination is available.
    if (publication?.htmlUrl && typeof window !== 'undefined') {
      window.location.assign(publication.htmlUrl);
    }
  };

  const getSortButtonClass = (isActive) =>
    [
      'cursor-pointer rounded-md px-2.5 py-1',
      'font-mono text-[11px] transition-colors duration-200',
      FOCUS_RING,
      isActive
        ? 'bg-white font-medium text-neutral-900 shadow-sm'
        : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
    ].join(' ');

  // ----------------------------------------------------------
  // Page
  // ----------------------------------------------------------

  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="space-y-10 md:space-y-12">
        {/* Page heading */}
        <section>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-500">
            Knowledge Repository
          </p>

          <h1 className="font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Academic Archive
          </h1>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-base leading-relaxed text-neutral-700">
              Browse notes across pure mathematics, applied mathematics,
              statistics, computer science, and optimization.
            </p>

            <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-neutral-500">
              {String(publications.length).padStart(2, '0')} Total Records
            </p>
          </div>
        </section>

        {/* Category filters */}
        <section aria-label="Filter publications by category">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Browse by discipline
            </h2>

            <span className="font-mono text-xs text-neutral-500">
              {String(categories.length).padStart(2, '0')} CATEGORIES
            </span>
          </div>

          <div className="flex flex-wrap gap-2 border-y border-neutral-200 py-4">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              aria-pressed={normalizeCategory(selectedCategory) === 'all'}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 ${FOCUS_RING} ${
                normalizeCategory(selectedCategory) === 'all'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              All
            </button>

            {categories.map((category, index) => {
              const categoryName = category?.name;
              if (!categoryName) return null;

              const isSelected =
                normalizeCategory(selectedCategory) ===
                normalizeCategory(categoryName);

              return (
                <button
                  key={category?.id ?? categoryName ?? index}
                  type="button"
                  onClick={() => setSelectedCategory(categoryName)}
                  aria-pressed={isSelected}
                  className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 ${FOCUS_RING} ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </section>

        {/* Result count, latest revision, and sorting controls */}
        <section aria-live="polite" aria-atomic="true">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                SHOWING {processedPublications.length} RECORDS
              </h2>

              <span className="font-mono text-[11px] uppercase tracking-wide text-neutral-500">
                Latest revision: {latestRevisionDate}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Sort publications"
                className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-neutral-100/60 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  aria-pressed={sortBy === 'recent'}
                  className={getSortButtonClass(sortBy === 'recent')}
                >
                  Recently Revised
                </button>

                <button
                  type="button"
                  onClick={() => setSortBy('category')}
                  aria-pressed={sortBy === 'category'}
                  className={getSortButtonClass(sortBy === 'category')}
                >
                  By Discipline
                </button>
              </div>

              {normalizeCategory(selectedCategory) !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`cursor-pointer text-xs text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900 ${FOCUS_RING}`}
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Publication list */}
          {processedPublications.length > 0 ? (
            <div className="mt-2">
              {processedPublications.map((publication, index) => {
                const isPublished = isPublicationPublished(publication);
                const revisionLabel = getRevisionLabel(publication);
                const statusLabel = isPublished
                  ? 'PUBLISHED'
                  : 'IN PROGRESS';

                return (
                  <article
                    key={publication?.id ?? `${publication?.title ?? 'note'}-${index}`}
                    className="border-b border-neutral-200/80 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => openPublication(publication)}
                      aria-label={`Open ${publication?.title || 'Untitled Note'}`}
                      className={`group -mx-6 flex w-[calc(100%_+_3rem)] cursor-pointer flex-col gap-4 rounded-2xl border border-transparent p-6 text-left transition-all duration-200 hover:border-neutral-200/80 hover:bg-neutral-100/90 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6 ${FOCUS_RING}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                            {publication?.category ?? 'Uncategorized'}
                          </span>

                          <span className="text-neutral-300" aria-hidden="true">
                            /
                          </span>

                          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                            {publication?.date ?? 'Undated'}
                          </span>

                          {revisionLabel &&
                            publication?.lastEdited &&
                            publication.lastEdited !== publication.date && (
                              <>
                                <span className="text-neutral-300" aria-hidden="true">
                                  /
                                </span>

                                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                                  Updated {revisionLabel}
                                </span>
                              </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight text-neutral-800 transition-colors duration-200 group-hover:text-neutral-950 sm:text-2xl">
                            {publication?.title ?? 'Untitled Note'}
                          </h3>

                          <span
                            className={`inline-flex shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                              isPublished
                                ? 'border-neutral-300 text-neutral-700'
                                : 'border-neutral-200 text-neutral-500'
                            }`}
                          >
                            [{statusLabel}]
                          </span>
                        </div>

                        {(publication?.summary || publication?.abstract) && (
                          <p className="mt-3 max-w-[76ch] text-sm leading-relaxed text-neutral-700 md:text-base">
                            {publication.summary || publication.abstract}
                          </p>
                        )}

                        {publication?.readingTime &&
                          !String(publication.readingTime)
                            .toLowerCase()
                            .includes('in progress') && (
                            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                              {publication.readingTime}
                            </p>
                          )}
                      </div>

                      <span
                        aria-hidden="true"
                        className="flex shrink-0 items-center justify-between gap-3 font-mono text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900 sm:justify-end"
                      >
                        <span className="text-xs text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900 sm:hidden">
                          {isPublished ? 'Read notes' : 'View entry'}
                        </span>
                        <span className="inline-block text-lg leading-none transition-all duration-200 group-hover:translate-x-1.5">
                          →
                        </span>
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-serif text-xl text-neutral-900">
                No notes in this category yet
              </p>

              <p className="mt-2 text-sm text-neutral-600">
                Try another discipline or view the full archive.
              </p>

              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`mt-5 cursor-pointer text-sm text-neutral-700 underline underline-offset-4 transition-colors hover:text-neutral-950 ${FOCUS_RING}`}
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
