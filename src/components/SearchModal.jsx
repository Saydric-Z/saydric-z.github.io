// src/components/SearchModal.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Search,
  X,
} from 'lucide-react';

import { SITE_DATA } from '../data/siteData';

// ------------------------------------------------------------
// Navigation shortcuts
// ------------------------------------------------------------

const NAV_PAGES = [
  { label: 'About', view: 'about' },
  { label: 'Notes', view: 'notes' },
  { label: 'Blogs', view: 'blogs' },
];

// ------------------------------------------------------------
// Date parsing and sorting
// ------------------------------------------------------------

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

/**
 * Parse common publication date formats, including:
 * - OCT 15, 2026
 * - NOV 12, 2026
 * - OCT 2026
 * - ISO date strings
 *
 * Returns a timestamp, or null when the date is invalid.
 */
function parsePublicationDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  const text = String(value).trim();

  if (!text) return null;

  // Handle ISO timestamps and other formats supported by the browser.
  const nativeTimestamp = Date.parse(text);

  if (Number.isFinite(nativeTimestamp)) {
    return nativeTimestamp;
  }

  // Explicitly support abbreviated English month formats.
  const normalized = text
    .toUpperCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const match = normalized.match(
    /^([A-Z]{3})\s+(?:(\d{1,2})\s+)?(\d{4})$/,
  );

  if (!match) return null;

  const month = MONTHS[match[1]];
  const day = match[2] ? Number(match[2]) : 1;
  const year = Number(match[3]);

  if (
    month === undefined ||
    !Number.isInteger(year) ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month, day));

  // Reject invalid calendar dates rather than silently normalizing them.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.getTime();
}

/**
 * Prefer lastEdited; use date when lastEdited is absent or invalid.
 * If effective dates are equal, use the publication date as a
 * deterministic secondary sort key.
 */
function getEffectiveTimestamp(publication) {
  return (
    parsePublicationDate(publication?.lastEdited) ??
    parsePublicationDate(publication?.date) ??
    0
  );
}

function getPublicationDateTimestamp(publication) {
  return parsePublicationDate(publication?.date) ?? 0;
}

// ------------------------------------------------------------
// SearchModal
// ------------------------------------------------------------

export default function SearchModal({
  isOpen,
  onClose,
  onSelectNote,
  onNavigate,
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const resultRefs = useRef([]);

  // ----------------------------------------------------------
  // Source data: newest changes first
  // ----------------------------------------------------------

  const sortedPublications = useMemo(() => {
    const source = Array.isArray(SITE_DATA?.publications)
      ? SITE_DATA.publications
      : [];

    return source
      .map((publication, originalIndex) => ({
        publication,
        originalIndex,
      }))
      .sort((a, b) => {
        const timestampA = getEffectiveTimestamp(
          a.publication,
        );

        const timestampB = getEffectiveTimestamp(
          b.publication,
        );

        // Primary sort: latest edit/publication date first.
        if (timestampA !== timestampB) {
          return timestampB - timestampA;
        }

        // Secondary sort: later publication date first.
        const publicationDateA =
          getPublicationDateTimestamp(a.publication);

        const publicationDateB =
          getPublicationDateTimestamp(b.publication);

        if (publicationDateA !== publicationDateB) {
          return publicationDateB - publicationDateA;
        }

        // Preserve original ordering when both dates are equal.
        return a.originalIndex - b.originalIndex;
      })
      .map(({ publication }) => publication);
  }, []);

  // ----------------------------------------------------------
  // Instant search
  // ----------------------------------------------------------

  const filteredNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      // The archive opens with the eight most recently changed notes.
      return sortedPublications.slice(0, 8);
    }

    return sortedPublications.filter((publication) => {
      const searchableFields = [
        publication?.title,
        publication?.category,
        publication?.summary,
        publication?.abstract,
      ];

      return searchableFields.some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [sortedPublications, query]);

  // Keep the selected index within the available results.
  const safeActiveIndex =
    filteredNotes.length > 0
      ? Math.min(activeIndex, filteredNotes.length - 1)
      : 0;

  // ----------------------------------------------------------
  // Focus management and page scrolling
  // ----------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Scroll the active result into view.
  // This effect does not update React state.
  useEffect(() => {
    if (!isOpen) return;

    resultRefs.current[safeActiveIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [isOpen, safeActiveIndex]);

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  const closeModal = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const navigateToPage = useCallback(
    (view) => {
      onNavigate?.(view);
      onClose?.();
    },
    [onNavigate, onClose],
  );

  const chooseNote = useCallback(
    (publication) => {
      if (!publication) return;

      onSelectNote?.(publication);
      onClose?.();
    },
    [onSelectNote, onClose],
  );

  // ----------------------------------------------------------
  // Keyboard navigation
  // ----------------------------------------------------------

  const handleInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
      return;
    }

    if (event.key === 'ArrowDown') {
      if (filteredNotes.length === 0) return;

      event.preventDefault();

      setActiveIndex(
        (previous) => (previous + 1) % filteredNotes.length,
      );

      return;
    }

    if (event.key === 'ArrowUp') {
      if (filteredNotes.length === 0) return;

      event.preventDefault();

      setActiveIndex((previous) =>
        previous <= 0
          ? filteredNotes.length - 1
          : previous - 1,
      );

      return;
    }

    if (event.key === 'Enter') {
      if (filteredNotes.length === 0) return;

      event.preventDefault();
      chooseNote(filteredNotes[safeActiveIndex]);
    }
  };

  // ----------------------------------------------------------
  // Visual helpers
  // ----------------------------------------------------------

  const getResultClassName = (isActive) =>
    [
      'block w-full cursor-pointer rounded-lg px-3 py-3 text-left',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
      isActive
        ? 'bg-neutral-100 dark:bg-neutral-800'
        : 'hover:bg-neutral-100/70 dark:hover:bg-white/[0.04]',
    ].join(' ');

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pb-8 pt-[12vh] backdrop-blur-[2px] sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#111111]"
      >
        {/* ==================================================
            Search input
            ================================================== */}

        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-800 sm:px-5">
          <Search
            className="h-5 w-5 shrink-0 text-neutral-400"
            aria-hidden="true"
          />

          <label
            id="search-modal-title"
            htmlFor="archive-search-input"
            className="sr-only"
          >
            Search academic notes
          </label>

          <input
            ref={inputRef}
            id="archive-search-input"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search archive..."
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          />

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ==================================================
            Horizontal navigation bar
            ================================================== */}

        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800/80 dark:bg-neutral-900/50">
          <div className="flex items-center gap-1.5">
            <span className="mr-2 shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Jump to:
            </span>

            {NAV_PAGES.map((tab) => (
              <button
                key={tab.view}
                type="button"
                onClick={() => navigateToPage(tab.view)}
                className="cursor-pointer rounded-md px-2.5 py-1 font-mono text-xs text-neutral-600 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================
            Notes list — pure text, latest first
            ================================================== */}

        <div className="max-h-[min(60vh,520px)] overflow-y-auto p-2">
          <section aria-label="Academic notes">
            <h2 className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              {query.trim()
                ? 'Matching Notes'
                : 'Notes Archive'}
            </h2>

            {filteredNotes.length > 0 ? (
              <ul className="space-y-1">
                {filteredNotes.map((publication, index) => {
                  const isActive =
                    index === safeActiveIndex;

                  const isPublished =
                    Boolean(publication?.htmlUrl);

                  return (
                    <li
                      key={
                        publication?.id ||
                        publication?.title ||
                        index
                      }
                    >
                      <button
                        ref={(element) => {
                          resultRefs.current[index] = element;
                        }}
                        type="button"
                        onMouseEnter={() =>
                          setActiveIndex(index)
                        }
                        onFocus={() =>
                          setActiveIndex(index)
                        }
                        onClick={() => chooseNote(publication)}
                        className={getResultClassName(isActive)}
                      >
                        {/* Title and publication status */}
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {publication?.title || 'Untitled Note'}
                          </span>

                          <span
                            className={[
                              'rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide',
                              isPublished
                                ? 'border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400'
                                : 'border-neutral-200 text-neutral-400 dark:border-neutral-700 dark:text-neutral-500',
                            ].join(' ')}
                          >
                            {isPublished
                              ? 'Published'
                              : 'In Progress'}
                          </span>
                        </span>

                        {/* Category */}
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                          {publication?.category || 'Uncategorized'}
                        </span>

                        {/* Summary */}
                        {(publication?.summary ||
                          publication?.abstract) && (
                          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                            {publication.summary ||
                              publication.abstract}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <Search
                  className="mx-auto mb-3 h-5 w-5 text-neutral-300 dark:text-neutral-700"
                  aria-hidden="true"
                />

                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  No matching notes found
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-400">
                  Try another title, subject, or keyword.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ==================================================
            Keyboard hints
            ================================================== */}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-200 font-mono dark:border-neutral-700">
                <ArrowUp
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </kbd>

              <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-200 font-mono dark:border-neutral-700">
                <ArrowDown
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </kbd>

              Navigate
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center justify-center rounded border border-neutral-200 px-1.5 font-mono dark:border-neutral-700">
                <CornerDownLeft
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </kbd>

              Open note
            </span>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer text-[10px] text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            ESC to close
          </button>
        </footer>
      </section>
    </div>
  );
}