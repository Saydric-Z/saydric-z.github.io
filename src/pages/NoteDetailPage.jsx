import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  ListTree,
} from 'lucide-react';

import { UI } from '../data/siteData';

// ============================================================
// Constants
// ============================================================

const MIN_IFRAME_HEIGHT = 950;
const PARENT_SCROLL_OFFSET = 90;
const EMPTY_ARRAY = [];

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400';

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

// The four major chapters in Probability and Statistics.
// These are used only to regroup its own flat outline.
const MAJOR_CHAPTER_TITLES = new Set([
  'univariate discrete probability distribution',
  'univariate continuous probability distribution',
  'introduction to statistical science',
  'estimation theory',
]);

// ============================================================
// Text and TOC helpers
// ============================================================

function slugifyHeading(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeHeadingText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^\s*\d+(?:\.\d+)*[\s.)-]*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getEntryTitle(entry) {
  if (!entry) return '';

  if (typeof entry === 'string') {
    return entry;
  }

  return entry.title || entry.label || entry.name || '';
}

function getEntryChildren(entry) {
  if (Array.isArray(entry?.items)) {
    return entry.items;
  }

  if (Array.isArray(entry?.children)) {
    return entry.children;
  }

  return EMPTY_ARRAY;
}

/**
 * Preserve explicitly nested TOC data.
 *
 * When the current publication supplies a flat list containing the
 * four known major chapters, group subsections under those chapters.
 *
 * Never read or reuse another publication's outline.
 */
function prepareTableOfContents(outline) {
  if (!Array.isArray(outline) || outline.length === 0) {
    return EMPTY_ARRAY;
  }

  const alreadyNested = outline.some(
    (entry) => getEntryChildren(entry).length > 0,
  );

  if (alreadyNested) {
    return outline.map((entry) => ({
      ...entry,
      items: getEntryChildren(entry),
    }));
  }

  const containsMajorChapter = outline.some((entry) =>
    MAJOR_CHAPTER_TITLES.has(
      normalizeHeadingText(getEntryTitle(entry)),
    ),
  );

  // Other publications keep their own outline unchanged.
  if (!containsMajorChapter) {
    return outline;
  }

  const grouped = [];
  let currentChapter = null;

  outline.forEach((entry) => {
    const isMajorChapter = MAJOR_CHAPTER_TITLES.has(
      normalizeHeadingText(getEntryTitle(entry)),
    );

    if (isMajorChapter) {
      currentChapter = {
        ...entry,
        items: [],
      };

      grouped.push(currentChapter);
      return;
    }

    if (currentChapter) {
      currentChapter.items.push(entry);
    } else {
      grouped.push(entry);
    }
  });

  return grouped;
}

function getSectionKey(section, sectionIndex) {
  return String(
    section?.id ||
      section?.anchorId ||
      section?.slug ||
      `section-${sectionIndex}`,
  );
}

function getEntryKey(section, sectionIndex, item, itemIndex) {
  const sectionKey = getSectionKey(section, sectionIndex);

  if (item === undefined || item === null) {
    return `${sectionKey}:section`;
  }

  const itemId =
    typeof item === 'object'
      ? item.id || item.anchorId || item.slug
      : null;

  return `${sectionKey}:item-${itemId || itemIndex}`;
}

/**
 * Generate possible anchor IDs for:
 * - Explicit siteData.js IDs
 * - Kebab-case heading IDs
 * - Quarto sec- prefixes
 * - Generated section IDs
 */
function getAnchorCandidates(section, sectionIndex, item) {
  const isItem = item !== undefined && item !== null;
  const entry = isItem ? item : section;

  const title = getEntryTitle(entry);

  const suppliedIds = [
    entry && typeof entry === 'object' ? entry.anchorId : null,
    entry && typeof entry === 'object' ? entry.id : null,
    entry && typeof entry === 'object' ? entry.slug : null,
    !isItem && section && typeof section === 'object'
      ? section.sectionId
      : null,
  ];

  const candidates = [
    ...suppliedIds,
    slugifyHeading(title),
  ];

  if (!isItem && sectionIndex >= 0) {
    candidates.push(`section-${sectionIndex + 1}`);
  }

  return [
    ...new Set(
      candidates
        .filter(
          (id) =>
            typeof id === 'string' &&
            id.trim().length > 0,
        )
        .flatMap((id) => [
          id,
          id.startsWith('sec-')
            ? id.slice(4)
            : `sec-${id}`,
        ]),
    ),
  ];
}

// ============================================================
// Cross-iframe heading lookup
// ============================================================

function isHeadingElement(element) {
  return Boolean(
    element &&
      /^H[1-6]$/.test(element.tagName),
  );
}

function findHeadingWithin(element, title) {
  if (!element) return null;

  if (isHeadingElement(element)) {
    return element;
  }

  const headings = element.querySelectorAll(
    HEADING_SELECTOR,
  );

  const wanted = normalizeHeadingText(title);

  for (const heading of headings) {
    const actual = normalizeHeadingText(
      heading.textContent || '',
    );

    if (
      wanted &&
      (actual === wanted || actual.includes(wanted))
    ) {
      return heading;
    }
  }

  return headings[0] || null;
}

function findIframeTarget(doc, candidates, title) {
  if (!doc) return null;

  // First, try explicit IDs and their Quarto variants.
  for (const id of candidates) {
    const node = doc.getElementById(id);

    if (!node) continue;

    const heading = findHeadingWithin(node, title);

    if (heading) {
      return heading;
    }
  }

  // Second, match the actual heading text.
  const wanted = normalizeHeadingText(title);

  if (!wanted) return null;

  const headings = doc.querySelectorAll(HEADING_SELECTOR);

  for (const heading of headings) {
    const actual = normalizeHeadingText(
      heading.textContent || '',
    );

    if (
      actual &&
      (actual === wanted || actual.includes(wanted))
    ) {
      return heading;
    }
  }

  // Third, try common generated heading links.
  const links = doc.querySelectorAll(
    'a[id], a.anchorjs-link, a.header-anchor',
  );

  for (const link of links) {
    const parentHeading = link.closest(
      HEADING_SELECTOR,
    );

    if (
      parentHeading &&
      normalizeHeadingText(
        parentHeading.textContent || '',
      ) === wanted
    ) {
      return parentHeading;
    }
  }

  return null;
}

/**
 * Scroll the outer browser window to the corresponding Quarto heading.
 *
 * This calculation assumes the auto-height iframe is not internally
 * scrolled. That is the intended layout for the published note.
 */
function scrollIframeToEntry(iframe, entry) {
  if (!iframe || !entry) {
    return false;
  }

  try {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;

    if (!doc || !win || !doc.documentElement) {
      return false;
    }

    const title = getEntryTitle(
      entry.item ?? entry.section,
    );

    const candidates = getAnchorCandidates(
      entry.section,
      entry.sectionIndex,
      entry.item,
    );

    const element = findIframeTarget(
      doc,
      candidates,
      title,
    );

    if (element) {
      // Absolute position relative to the parent window.
      const targetTop =
        iframe.getBoundingClientRect().top +
        window.scrollY +
        element.getBoundingClientRect().top -
        PARENT_SCROLL_OFFSET;

      // Synchronize the inner document's hash where possible.
      const anchorElement = element.id
        ? element
        : element.closest('[id]');

      if (anchorElement?.id) {
        try {
          win.history.replaceState(
            null,
            '',
            `#${encodeURIComponent(anchorElement.id)}`,
          );
        } catch {
          // Hash synchronization is optional.
        }
      }

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });

      return true;
    }

    // Fallback to fragment navigation.
    const fallback =
      slugifyHeading(title) || candidates[0];

    if (fallback && win) {
      win.location.hash = encodeURIComponent(fallback);
      return true;
    }
  } catch (error) {
    // Cross-origin iframe documents cannot expose their DOM.
    // Fragment navigation may still work.
    try {
      const candidates = getAnchorCandidates(
        entry.section,
        entry.sectionIndex,
        entry.item,
      );

      const fallback =
        slugifyHeading(entry.title) || candidates[0];

      if (fallback && iframe.contentWindow) {
        iframe.contentWindow.location.hash =
          encodeURIComponent(fallback);

        return true;
      }
    } catch {
      console.warn(
        'Could not navigate to this heading. Check iframe origin and anchor IDs.',
        error,
      );
    }
  }

  return false;
}

// ============================================================
// Loading UI
// ============================================================

function LoadingSkeleton() {
  return (
    <div
      className="absolute inset-0 z-10 animate-pulse bg-[#fafaf9] px-6 py-10 dark:bg-[#0a0a0a] sm:px-12 sm:py-14"
      role="status"
      aria-live="polite"
      aria-label="Loading academic notes"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800" />

        <div className="space-y-3">
          <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 w-1/2 bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />

        <div className="space-y-4 pt-2">
          <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-900" />
          <div className="h-3 w-11/12 bg-neutral-100 dark:bg-neutral-900" />
          <div className="h-3 w-4/5 bg-neutral-100 dark:bg-neutral-900" />
        </div>

        <p className="pt-2 text-center font-mono text-[11px] tracking-wide text-neutral-400">
          Loading academic notes &amp; typesetting mathematics...
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Unpublished note placeholder
// ============================================================

function InProgressPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-20 text-center dark:border-neutral-800 dark:bg-white/[0.01]">
      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        Manuscript in Preparation
      </span>

      <h3 className="mt-4 font-serif text-xl font-medium text-neutral-900 dark:text-neutral-100">
        Typesetting in Progress
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-neutral-500">
        This transcript is currently being compiled and typeset
        with LaTeX &amp; Quarto pipeline. The complete interactive
        note will be available here soon.
      </p>
    </div>
  );
}

// ============================================================
// Table of contents
// ============================================================

function TocTree({
  tableOfContents,
  expandedSections,
  activeTocKey,
  onToggleSection,
  onNavigate,
}) {
  return (
    <ul className="space-y-3 pt-2">
      {tableOfContents.map((section, sectionIndex) => {
        const sectionKey = getSectionKey(
          section,
          sectionIndex,
        );

        const items = getEntryChildren(section);
        const isExpanded =
          expandedSections.has(sectionKey);

        const sectionTitle = getEntryTitle(section);

        const sectionEntry = {
          section,
          sectionIndex,
          item: null,
          itemIndex: -1,
          key: getEntryKey(section, sectionIndex),
          title: sectionTitle,
        };

        const isSectionActive =
          activeTocKey === sectionEntry.key;

        return (
          <li
            key={sectionKey}
            className="min-w-0"
          >
            <div className="flex min-w-0 items-start gap-1">
              {/* Chapter expand / collapse */}
              <button
                type="button"
                onClick={() =>
                  items.length > 0
                    ? onToggleSection(section, sectionIndex)
                    : onNavigate(sectionEntry)
                }
                aria-label={
                  items.length > 0
                    ? `${isExpanded ? 'Collapse' : 'Expand'} ${sectionTitle}`
                    : `Navigate to ${sectionTitle}`
                }
                aria-expanded={
                  items.length > 0
                    ? isExpanded
                    : undefined
                }
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white ${FOCUS_RING}`}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Chapter title */}
              <button
                type="button"
                onClick={() => onNavigate(sectionEntry)}
                className={`min-w-0 flex-1 cursor-pointer break-words py-1 text-left text-[13px] leading-snug transition-colors ${
                  isSectionActive
                    ? 'font-semibold text-neutral-950 dark:text-white'
                    : 'font-semibold text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                } ${FOCUS_RING}`}
              >
                <span className="mr-2 font-mono text-[11px] font-normal tabular-nums text-neutral-400">
                  {(sectionIndex + 1)
                    .toString()
                    .padStart(2, '0')}
                </span>

                {sectionTitle}
              </button>
            </div>

            {/* Nested subsections */}
            {items.length > 0 && isExpanded && (
              <ul className="ml-3 mt-2 space-y-1.5 border-l border-neutral-200 pl-5 dark:border-neutral-800">
                {items.map((item, itemIndex) => {
                  const entry = {
                    section,
                    sectionIndex,
                    item,
                    itemIndex,
                    key: getEntryKey(
                      section,
                      sectionIndex,
                      item,
                      itemIndex,
                    ),
                    title: getEntryTitle(item),
                  };

                  const isItemActive =
                    activeTocKey === entry.key;

                  return (
                    <li
                      key={entry.key}
                      className="min-w-0"
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate(entry)}
                        className={`block w-full cursor-pointer break-words py-0.5 text-left text-xs leading-relaxed transition-colors ${
                          isItemActive
                            ? 'font-medium text-neutral-900 dark:text-white'
                            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        } ${FOCUS_RING}`}
                      >
                        {entry.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================
// NoteDetailPage
// ============================================================

export default function NoteDetailPage({
  publication,
  onBack,
  onSelectCategory,
}) {
  if (!publication) {
    return null;
  }

  // Strict publication condition.
  // Never fall back to probability.html or another note.
  const isPublished = Boolean(publication?.htmlUrl);

  const noteHtmlUrl = isPublished
    ? publication.htmlUrl
    : null;

  // Remount content and reset TOC / iframe state for a new note.
  const iframeKey = [
    publication.id || publication.title || 'note',
    noteHtmlUrl || 'in-progress',
  ].join(':');

  return (
    <NoteDetailPageContent
      key={iframeKey}
      publication={publication}
      isPublished={isPublished}
      noteHtmlUrl={noteHtmlUrl}
      onBack={onBack}
      onSelectCategory={onSelectCategory}
      iframeKey={iframeKey}
    />
  );
}

// ============================================================
// Page content
// ============================================================

function NoteDetailPageContent({
  publication,
  isPublished,
  noteHtmlUrl,
  onBack,
  onSelectCategory,
  iframeKey,
}) {
  const iframeRef = useRef(null);
  const pendingEntryRef = useRef(null);

  const [loadedFrameKey, setLoadedFrameKey] = useState(null);
  const [errorFrameKey, setErrorFrameKey] = useState(null);
  const [iframeLoadVersion, setIframeLoadVersion] = useState(0);
  const [iframeHeight, setIframeHeight] = useState(
    MIN_IFRAME_HEIGHT,
  );

  // An unpublished note cannot inherit the outline from another note.
  const tableOfContents = useMemo(
    () =>
      isPublished
        ? prepareTableOfContents(publication.onThisPage)
        : EMPTY_ARRAY,
    [isPublished, publication],
  );

  const [expandedSections, setExpandedSections] = useState(() => {
    const firstSection = tableOfContents[0];

    return firstSection
      ? new Set([getSectionKey(firstSection, 0)])
      : new Set();
  });

  const [activeTocKey, setActiveTocKey] = useState(null);

  const isLoading =
    isPublished && loadedFrameKey !== iframeKey;

  const iframeError =
    isPublished && errorFrameKey === iframeKey;

  // Flatten the current note's outline for scroll tracking.
  const flattenedTocEntries = useMemo(() => {
    const entries = [];

    tableOfContents.forEach((section, sectionIndex) => {
      entries.push({
        section,
        sectionIndex,
        item: null,
        itemIndex: -1,
        key: getEntryKey(section, sectionIndex),
        title: getEntryTitle(section),
      });

      getEntryChildren(section).forEach((item, itemIndex) => {
        entries.push({
          section,
          sectionIndex,
          item,
          itemIndex,
          key: getEntryKey(
            section,
            sectionIndex,
            item,
            itemIndex,
          ),
          title: getEntryTitle(item),
        });
      });
    });

    return entries;
  }, [tableOfContents]);

  const toggleSection = useCallback(
    (section, sectionIndex) => {
      const key = getSectionKey(section, sectionIndex);

      setExpandedSections((previous) => {
        const next = new Set(previous);

        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }

        return next;
      });
    },
    [],
  );

  // TOC navigation across the iframe boundary.
  const handleTocNavigate = useCallback(
    (entry) => {
      if (!isPublished) {
        return;
      }

      setActiveTocKey(entry.key);

      const sectionKey = getSectionKey(
        entry.section,
        entry.sectionIndex,
      );

      setExpandedSections(
        (previous) => new Set(previous).add(sectionKey),
      );

      const iframe = iframeRef.current;

      if (!iframe || loadedFrameKey !== iframeKey) {
        pendingEntryRef.current = entry;
        return;
      }

      if (!scrollIframeToEntry(iframe, entry)) {
        pendingEntryRef.current = entry;
      }
    },
    [iframeKey, isPublished, loadedFrameKey],
  );

  const handleIframeLoad = useCallback(() => {
    setLoadedFrameKey(iframeKey);
    setErrorFrameKey(null);
    setIframeLoadVersion((version) => version + 1);
  }, [iframeKey]);

  const handleIframeError = useCallback(() => {
    setErrorFrameKey(iframeKey);
    setLoadedFrameKey(iframeKey);
  }, [iframeKey]);

  // ==========================================================
  // Dynamic iframe sizing
  // Supports same-origin observers and postMessage messages.
  // ==========================================================

  useEffect(() => {
    if (
      !isPublished ||
      !iframeLoadVersion ||
      isLoading ||
      iframeError
    ) {
      return undefined;
    }

    const frame = iframeRef.current;
    const win = frame?.contentWindow;

    if (!frame || !win) {
      return undefined;
    }

    let doc = null;

    try {
      doc = frame.contentDocument;
    } catch {
      // Cross-origin documents cannot be measured directly.
    }

    let disposed = false;
    let animationFrame = null;
    let resizeObserver = null;
    let mutationObserver = null;

    const timers = [];

    const updateHeight = () => {
      if (disposed || !doc?.documentElement) {
        return;
      }

      try {
        const body = doc.body;
        const root = doc.documentElement;

        const viewportHeight =
          win.innerHeight || MIN_IFRAME_HEIGHT;

        const measurements = [
          root?.scrollHeight,
          root?.offsetHeight,
          body?.scrollHeight,
          body?.offsetHeight,
        ].filter(
          (value) =>
            Number.isFinite(value) &&
            value > viewportHeight + 2,
        );

        const contentHeight = measurements.length
          ? Math.max(...measurements) + 8
          : MIN_IFRAME_HEIGHT;

        setIframeHeight((current) =>
          Math.max(current, Math.ceil(contentHeight)),
        );
      } catch (error) {
        console.warn(
          'Unable to measure the Quarto document height.',
          error,
        );
      }
    };

    const scheduleHeightUpdate = () => {
      if (disposed || animationFrame !== null) {
        return;
      }

      animationFrame = win.requestAnimationFrame(() => {
        animationFrame = null;
        updateHeight();
      });
    };

    // postMessage support for Quarto pages that report their height.
    const handleHeightMessage = (event) => {
      if (event.source !== frame.contentWindow) {
        return;
      }

      const data = event.data;

      if (!data || typeof data !== 'object') {
        return;
      }

      const supportedTypes = [
        'quarto:resize',
        'iframe-resize',
        'IFRAME_HEIGHT',
        'quarto-height',
        'resize',
      ];

      if (
        data.type &&
        !supportedTypes.includes(data.type)
      ) {
        return;
      }

      const reportedHeight = Number(
        data.height ??
          data.iframeHeight ??
          data.scrollHeight,
      );

      if (
        !Number.isFinite(reportedHeight) ||
        reportedHeight <= 0
      ) {
        return;
      }

      setIframeHeight((current) =>
        Math.max(
          current,
          Math.ceil(reportedHeight) + 8,
          MIN_IFRAME_HEIGHT,
        ),
      );
    };

    window.addEventListener(
      'message',
      handleHeightMessage,
    );

    scheduleHeightUpdate();

    if (doc?.documentElement) {
      if (win.ResizeObserver) {
        resizeObserver = new win.ResizeObserver(
          scheduleHeightUpdate,
        );

        resizeObserver.observe(doc.documentElement);

        if (doc.body) {
          resizeObserver.observe(doc.body);
        }
      }

      if (win.MutationObserver) {
        mutationObserver = new win.MutationObserver(
          scheduleHeightUpdate,
        );

        mutationObserver.observe(doc.documentElement, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
        });
      }

      // Catch late typesetting and web-font layout changes.
      if (doc.fonts?.ready) {
        doc.fonts.ready
          .then(scheduleHeightUpdate)
          .catch(() => {});
      }

      [100, 450, 1200].forEach((delay) => {
        timers.push(
          win.setTimeout(scheduleHeightUpdate, delay),
        );
      });
    }

    return () => {
      disposed = true;

      window.removeEventListener(
        'message',
        handleHeightMessage,
      );

      if (animationFrame !== null) {
        win.cancelAnimationFrame(animationFrame);
      }

      timers.forEach((timer) => {
        win.clearTimeout(timer);
      });

      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [
    iframeLoadVersion,
    iframeError,
    isLoading,
    isPublished,
  ]);

  // Retry pending navigation after iframe loading.
  useEffect(() => {
    if (
      !isPublished ||
      !iframeLoadVersion ||
      isLoading ||
      !pendingEntryRef.current
    ) {
      return undefined;
    }

    const pending = pendingEntryRef.current;

    const timer = window.setTimeout(() => {
      if (
        scrollIframeToEntry(
          iframeRef.current,
          pending,
        )
      ) {
        pendingEntryRef.current = null;
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [
    iframeLoadVersion,
    isLoading,
    iframeHeight,
    isPublished,
  ]);

  // Automatically highlight the TOC entry nearest the scroll position.
  useEffect(() => {
    if (
      !isPublished ||
      !iframeLoadVersion ||
      isLoading ||
      iframeError
    ) {
      return undefined;
    }

    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;

    if (!frame || !doc || !win) {
      return undefined;
    }

    const targetEntries = flattenedTocEntries
      .map((entry) => ({
        target: findIframeTarget(
          doc,
          getAnchorCandidates(
            entry.section,
            entry.sectionIndex,
            entry.item,
          ),
          entry.title,
        ),
        key: entry.key,
      }))
      .filter((entry) => entry.target);

    if (targetEntries.length === 0) {
      return undefined;
    }

    const updateActiveToc = () => {
      const positions = targetEntries.map((entry) => ({
        key: entry.key,
        top:
          frame.getBoundingClientRect().top +
          window.scrollY +
          entry.target.getBoundingClientRect().top,
      }));

      const trackingLine =
        window.scrollY + PARENT_SCROLL_OFFSET + 24;

      const preceding = positions.filter(
        (position) => position.top <= trackingLine,
      );

      const active = preceding.length
        ? preceding.reduce((latest, position) =>
            position.top > latest.top
              ? position
              : latest,
          )
        : positions[0];

      if (active) {
        setActiveTocKey(active.key);
      }
    };

    const initialFrame =
      window.requestAnimationFrame(updateActiveToc);

    window.addEventListener(
      'scroll',
      updateActiveToc,
      { passive: true },
    );

    window.addEventListener(
      'resize',
      updateActiveToc,
    );

    const resizeObserver = window.ResizeObserver
      ? new window.ResizeObserver(updateActiveToc)
      : null;

    if (resizeObserver) {
      resizeObserver.observe(frame);
    }

    return () => {
      window.cancelAnimationFrame(initialFrame);

      window.removeEventListener(
        'scroll',
        updateActiveToc,
      );

      window.removeEventListener(
        'resize',
        updateActiveToc,
      );

      resizeObserver?.disconnect();
    };
  }, [
    flattenedTocEntries,
    iframeLoadVersion,
    isLoading,
    iframeError,
    iframeHeight,
    isPublished,
  ]);

  // ==========================================================
  // Publication metadata
  // ==========================================================

  const pdfUrl =
    typeof publication.pdfUrl === 'string' &&
    publication.pdfUrl.trim().length > 0
      ? publication.pdfUrl.trim()
      : null;

  const dateLabel =
    publication.date ||
    publication.lastEdited ||
    '';

  const abstractText =
    publication.abstract ||
    publication.summary ||
    'An abstract for this note has not been added yet.';

  // ==========================================================
  // Symmetric three-column layout
  // ==========================================================

  return (
    <main className="mx-auto w-full max-w-[1520px] px-6 py-10 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)_240px] xl:gap-12">

        {/* ====================================================
            LEFT SIDEBAR: BALANCING COLUMN
            ==================================================== */}

        <aside className="sticky top-24 hidden space-y-6 self-start lg:block">
          <button
            type="button"
            onClick={() => onBack?.()}
            className={`flex cursor-pointer items-center gap-2 font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${FOCUS_RING}`}
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Back to Archive
          </button>

          <div className="space-y-1 font-mono text-[11px] text-neutral-400">
            {publication.category && (
              <p className="uppercase tracking-wider">
                {publication.category}
              </p>
            )}

            {dateLabel && (
              <p>{dateLabel}</p>
            )}

            {publication.lastEdited &&
              publication.lastEdited !== publication.date && (
                <p>Updated {publication.lastEdited}</p>
              )}
          </div>

          <div className="h-px w-10 bg-neutral-200 dark:bg-neutral-800" />

          <p className="max-w-[190px] text-xs leading-6 text-neutral-400">
            Academic notes, definitions, derivations, and
            mathematical references.
          </p>
        </aside>

        {/* ====================================================
            CENTER COLUMN: NOTE CONTENT
            ==================================================== */}

        <article className="mx-auto w-full min-w-0 max-w-[920px]">

          {/* Mobile-only back navigation */}
          <div className="mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => onBack?.()}
              className={`flex cursor-pointer items-center gap-2 font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${FOCUS_RING}`}
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Back to Archive
            </button>
          </div>

          {/* Title */}
          <header className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              <span>
                {publication.category || 'Academic Notes'}
              </span>

              {dateLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <time>{dateLabel}</time>
                </>
              )}

              <span aria-hidden="true">·</span>

              <span
                className={
                  isPublished
                    ? 'text-emerald-700 dark:text-emerald-500'
                    : 'text-amber-700 dark:text-amber-500'
                }
              >
                {isPublished ? 'Published' : 'In Progress'}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                onSelectCategory?.(publication.category)
              }
              className={`mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-neutral-100 ${FOCUS_RING}`}
            >
              {publication.category || 'Academic Notes'}
            </button>

            <h1 className="break-words font-serif text-4xl font-normal leading-[1.15] tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl lg:text-6xl">
              {publication.title || 'Untitled Note'}
            </h1>

            {/* PDF actions: only when htmlUrl and pdfUrl both exist */}
            {isPublished && pdfUrl && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 font-mono text-xs font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <ExternalLink
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                  View PDF
                </a>

                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 font-mono text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-white/[0.04]"
                >
                  <Download
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                  Download
                </a>
              </div>
            )}
          </header>

          {/* Abstract */}
          <section
            aria-labelledby="note-abstract-heading"
            className="my-9 border-y border-neutral-200 py-7 dark:border-neutral-800"
          >
            <h2
              id="note-abstract-heading"
              className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              <FileText
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Abstract
            </h2>

            <p className="max-w-none font-serif text-base leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-lg">
              {abstractText}
            </p>
          </section>

          {/* ==================================================
              PUBLISHED NOTE

              No default URL and no fallback publication.
              ================================================== */}

          {isPublished && noteHtmlUrl ? (
            <section
              aria-label="Compiled academic notes"
              className="mt-8 min-w-0"
            >
              <div
                className="relative isolate w-full min-w-0 bg-transparent"
                style={{
                  height: `${iframeHeight}px`,
                  minHeight: `${MIN_IFRAME_HEIGHT}px`,
                }}
                aria-busy={isLoading}
              >
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={noteHtmlUrl}
                  title={`${publication.title || 'Academic note'} — Interactive academic notes`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  className={`absolute inset-0 block h-full w-full border-none bg-transparent transition-opacity duration-300 ${
                    isLoading
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-100'
                  }`}
                  loading="eager"
                  allowFullScreen
                />

                {isLoading && (
                  <div className="absolute inset-0 z-10">
                    <LoadingSkeleton />
                  </div>
                )}

                {iframeError && !isLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#fafaf9] px-6 text-center dark:bg-[#0a0a0a]">
                    <FileText
                      className="h-7 w-7 text-neutral-400"
                      aria-hidden="true"
                    />

                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      The academic note could not be loaded.
                    </p>

                    <a
                      href={noteHtmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium underline underline-offset-4"
                    >
                      Open the compiled HTML directly
                    </a>
                  </div>
                )}
              </div>
            </section>
          ) : (
            /* Unpublished notes never instantiate an iframe. */
            <section
              aria-label="Manuscript in preparation"
              className="mt-8 min-w-0"
            >
              <InProgressPlaceholder />
            </section>
          )}
        </article>

        {/* ====================================================
            RIGHT SIDEBAR: TABLE OF CONTENTS
            ==================================================== */}

        <aside className="sticky top-24 hidden w-[240px] min-w-0 self-start lg:block">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain pb-8 pr-1">
            <nav
              aria-label="On this page"
              className="space-y-3"
            >
              <h2 className="flex items-center gap-2 border-b border-neutral-200 pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 dark:border-neutral-800">
                <ListTree
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                On this page
              </h2>

              {tableOfContents.length > 0 ? (
                <TocTree
                  tableOfContents={tableOfContents}
                  expandedSections={expandedSections}
                  activeTocKey={activeTocKey}
                  onToggleSection={toggleSection}
                  onNavigate={handleTocNavigate}
                />
              ) : (
                <p className="max-w-[220px] py-2 text-xs leading-6 text-neutral-400">
                  No outline available for upcoming notes.
                </p>
              )}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}