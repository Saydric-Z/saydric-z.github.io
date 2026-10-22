import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search, X } from 'lucide-react';
import { SITE_DATA } from '../data/siteData';

const NAV_PAGES = [
  { label: 'About', view: 'about' },
  { label: 'Projects', view: 'projects' },
  { label: 'Notes', view: 'notes' },
  { label: 'Blogs', view: 'blogs' },
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

// ============================================================
// Date helpers
// ============================================================

function parsePublicationDate(value) {
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

  const match = normalized.match(
    /^([A-Z]{3})\s+(?:(\d{1,2})\s+)?(\d{4})$/,
  );

  if (match) {
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

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date.getTime();
  }

  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function effectiveTimestamp(publication) {
  return (
    parsePublicationDate(publication?.lastEdited) ??
    parsePublicationDate(publication?.date) ??
    0
  );
}

function publicationTimestamp(publication) {
  return parsePublicationDate(publication?.date) ?? 0;
}

function isPublished(publication) {
  return Boolean(
    publication?.htmlUrl || publication?.status === 'published',
  );
}

function resolveViewFromPath() {
  if (typeof window === 'undefined') return 'about';

  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/about') return 'about';
  if (path === '/projects') return 'projects';
  if (path === '/blogs') return 'blogs';
  if (path === '/notes' || path.startsWith('/notes/')) return 'notes';

  return 'notes';
}

// ============================================================
// SearchModal
// ============================================================

export default function SearchModal({
  isOpen,
  onClose,
  onSelectNote,
  onNavigate,
  currentView: currentViewProp,
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const resultRefs = useRef([]);

  const currentView = currentViewProp ?? resolveViewFromPath();

  const activeNavigationView =
    currentView === 'detail' || currentView === 'note-detail'
      ? 'notes'
      : currentView;

  // ----------------------------------------------------------
  // Sort by most recent revision
  // ----------------------------------------------------------

  const sortedPublications = useMemo(() => {
    const publications = Array.isArray(SITE_DATA?.publications)
      ? SITE_DATA.publications
      : [];

    return publications
      .map((publication, originalIndex) => ({
        publication,
        originalIndex,
      }))
      .sort((a, b) => {
        const revisionDifference =
          effectiveTimestamp(b.publication) -
          effectiveTimestamp(a.publication);

        if (revisionDifference !== 0) return revisionDifference;

        const dateDifference =
          publicationTimestamp(b.publication) -
          publicationTimestamp(a.publication);

        if (dateDifference !== 0) return dateDifference;

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
      return sortedPublications.slice(0, 8);
    }

    return sortedPublications.filter((publication) =>
      [
        publication?.title,
        publication?.category,
        publication?.summary,
        publication?.abstract,
      ].some((field) =>
        String(field || '').toLowerCase().includes(keyword),
      ),
    );
  }, [query, sortedPublications]);

  const safeActiveIndex = filteredNotes.length
    ? Math.min(activeIndex, filteredNotes.length - 1)
    : 0;

  // ----------------------------------------------------------
  // Focus and background scroll management
  // ----------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

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
    setQuery('');
    setActiveIndex(0);
    resultRefs.current = [];
    onClose?.();
  }, [onClose]);

  const navigateToPage = useCallback(
    (view) => {
      closeModal();
      onNavigate?.(view);
    },
    [closeModal, onNavigate],
  );

  const chooseNote = useCallback(
    (publication) => {
      if (!publication) return;

      closeModal();
      onSelectNote?.(publication);
    },
    [closeModal, onSelectNote],
  );

  // ----------------------------------------------------------
  // Keyboard navigation
  // ----------------------------------------------------------

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown' && filteredNotes.length > 0) {
      event.preventDefault();

      setActiveIndex(
        (previous) => (previous + 1) % filteredNotes.length,
      );

      return;
    }

    if (event.key === 'ArrowUp' && filteredNotes.length > 0) {
      event.preventDefault();

      setActiveIndex((previous) =>
        previous <= 0
          ? filteredNotes.length - 1
          : previous - 1,
      );

      return;
    }

    if (event.key === 'Enter' && filteredNotes.length > 0) {
      event.preventDefault();
      chooseNote(filteredNotes[safeActiveIndex]);
    }
  };

  if (!isOpen) return null;

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-start justify-center
        bg-neutral-950/20
        px-4 pb-8 pt-[10vh]
        backdrop-blur-sm
        sm:px-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      {/* 
        Main glass card: 
        Entire card shares a unified frosted glass surface (bg-white/75 + backdrop-blur-2xl).
        Header and Footer are fixed shrink-0 panes; only the middle section scrolls.
      */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDownCapture={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeModal();
          }
        }}
        className="
          flex max-h-[min(78vh,680px)]
          w-full max-w-xl
          flex-col overflow-hidden
          rounded-2xl
          border border-white/80
          bg-white/75
          shadow-[0_24px_60px_rgba(0,0,0,0.1)]
          ring-1 ring-black/5
          backdrop-blur-2xl
        "
      >
        {/* ==================================================
            1. Top Fixed Header (Input + JUMP TO)
            Purely transparent so the parent's glass shows through,
            and never overlaps with scrolling list items.
            ================================================== */}
        <div
          className="
            shrink-0
            border-b border-neutral-900/10
            bg-transparent
            px-5 pt-4 pb-3
          "
        >
          {/* Search input */}
          <div className="flex items-center gap-3">
            <Search
              className="h-4 w-4 shrink-0 text-neutral-500"
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
              className="
                h-9 min-w-0 flex-1
                bg-transparent
                text-sm text-neutral-900
                placeholder:text-neutral-400
                focus:outline-none
              "
            />

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close search"
              className="
                flex h-7 w-7 shrink-0
                cursor-pointer items-center justify-center
                rounded-md
                text-neutral-400
                transition-colors
                hover:bg-neutral-900/5
                hover:text-neutral-800
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-neutral-400
              "
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* JUMP TO navigation */}
          <nav
            aria-label="Jump to page"
            className="
              mt-2.5 flex flex-wrap items-center gap-1.5
              border-t border-neutral-900/5
              pt-2.5
            "
          >
            <span
              className="
                mr-1 shrink-0
                font-mono text-[10px]
                uppercase tracking-wider
                text-neutral-500
              "
            >
              Jump to:
            </span>

            {NAV_PAGES.map((page) => {
              const isActive = activeNavigationView === page.view;

              return (
                <button
                  key={page.view}
                  type="button"
                  onClick={() => navigateToPage(page.view)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    cursor-pointer rounded-md
                    px-2.5 py-1
                    font-mono text-xs
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-neutral-400
                    ${
                      isActive
                        ? 'bg-neutral-900/10 font-medium text-neutral-900'
                        : 'text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900'
                    }
                  `}
                >
                  {page.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ==================================================
            2. Middle Dedicated Scrollable List
            Scrolls cleanly between header and footer without bleeding.
            ================================================== */}
        <section
          aria-label="Academic notes"
          className="
            min-h-0 flex-1
            overflow-y-auto overscroll-contain
            bg-transparent
            px-3 py-2.5
            [scrollbar-width:thin]
            [scrollbar-color:rgba(115,115,115,0.22)_transparent]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-neutral-400/30
            [&::-webkit-scrollbar-thumb:hover]:bg-neutral-500/45
          "
        >
          <h2
            className="
              px-3 py-1.5
              font-mono text-[10px]
              uppercase tracking-widest
              text-neutral-500
            "
          >
            {query.trim() ? 'Matching Notes' : 'Notes Archive'}
          </h2>

          {filteredNotes.length > 0 ? (
            <ul className="space-y-1">
              {filteredNotes.map((publication, index) => {
                const selected = index === safeActiveIndex;
                const published = isPublished(publication);

                return (
                  <li
                    key={
                      publication?.id ??
                      publication?.title ??
                      index
                    }
                  >
                    <button
                      ref={(element) => {
                        resultRefs.current[index] = element;
                      }}
                      type="button"
                      data-selected={selected ? 'true' : 'false'}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => chooseNote(publication)}
                      className="
                        block w-full cursor-pointer
                        rounded-xl bg-transparent
                        px-3.5 py-3 text-left
                        transition-colors duration-150
                        hover:bg-neutral-900/[0.06]
                        data-[selected=true]:bg-neutral-900/[0.06]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-neutral-500/60
                      "
                    >
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="break-words font-serif text-sm font-semibold text-neutral-900">
                          {publication?.title || 'Untitled Note'}
                        </span>

                        <span
                          className={`
                            rounded border
                            px-1.5 py-0.5
                            font-mono text-[9px]
                            uppercase tracking-wider
                            ${
                              published
                                ? 'border-neutral-400/60 bg-white/40 text-neutral-700'
                                : 'border-neutral-300/70 text-neutral-500'
                            }
                          `}
                        >
                          {published ? 'Published' : 'In Progress'}
                        </span>
                      </span>

                      <span
                        className="
                          mt-1 block
                          font-mono text-[10px]
                          uppercase tracking-wider
                          text-neutral-500
                        "
                      >
                        {publication?.category || 'Uncategorized'}
                      </span>

                      {(publication?.summary ||
                        publication?.abstract) && (
                        <span
                          className="
                            mt-1 block line-clamp-2
                            text-xs leading-relaxed
                            text-neutral-600
                          "
                        >
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
              <p className="text-sm font-medium text-neutral-700">
                No matching notes found
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Try another title, subject, or keyword.
              </p>
            </div>
          )}
        </section>

        {/* ==================================================
            3. Bottom Fixed Footer
            Purely transparent so the parent's glass shows through,
            and never clips or overlaps with the last note item.
            ================================================== */}
        <footer
          className="
            shrink-0
            flex flex-wrap items-center justify-between
            gap-3
            border-t border-neutral-900/10
            bg-transparent
            px-5 py-2.5
            font-mono text-[11px]
            text-neutral-500
          "
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <kbd
                className="
                  inline-flex h-5 min-w-5 items-center justify-center
                  rounded border border-neutral-400/50
                  bg-white/40 px-1 font-mono text-[10px] text-neutral-700
                "
              >
                ↑
              </kbd>

              <kbd
                className="
                  inline-flex h-5 min-w-5 items-center justify-center
                  rounded border border-neutral-400/50
                  bg-white/40 px-1 font-mono text-[10px] text-neutral-700
                "
              >
                ↓
              </kbd>

              Navigate
            </span>

            <span className="inline-flex items-center gap-1.5">
              <kbd
                className="
                  inline-flex h-5 items-center justify-center
                  rounded border border-neutral-400/50
                  bg-white/40 px-1.5 font-mono text-[10px] text-neutral-700
                "
              >
                ↵
              </kbd>

              Open note
            </span>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="
              cursor-pointer
              text-[11px] text-neutral-500
              transition-colors
              hover:text-neutral-900
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-neutral-400
            "
          >
            ESC to close
          </button>
        </footer>
      </section>
    </div>
  );
}