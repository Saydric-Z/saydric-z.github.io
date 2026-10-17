// src/App.jsx

import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header';
import SearchModal from './components/SearchModal';

import AboutPage from './pages/AboutPage';
import ArchivePage from './pages/ArchivePage';
import NoteDetailPage from './pages/NoteDetailPage';

import { SITE_DATA } from './data/siteData';

// ============================================================
// Native URL routing helpers
// ============================================================

const VIEW_PATHS = {
  about: '/about',
  notes: '/notes',
  blogs: '/blogs',
};

function normalizePath(pathname = '/') {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}

function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Resolve a browser pathname into the current application view.
 *
 * Supported routes:
 *   /             -> About
 *   /about        -> About
 *   /notes        -> Notes archive
 *   /blogs        -> Blogs
 *   /notes/:id    -> Note detail
 *
 * Unknown routes fall back to /notes.
 */
function resolveRoute(pathname) {
  const path = normalizePath(pathname);

  if (path === '/' || path === '/about') {
    return {
      view: 'about',
      publication: null,
      canonicalPath: path,
    };
  }

  if (path === '/notes') {
    return {
      view: 'notes',
      publication: null,
      canonicalPath: '/notes',
    };
  }

  if (path === '/blogs') {
    return {
      view: 'blogs',
      publication: null,
      canonicalPath: '/blogs',
    };
  }

  const detailMatch = path.match(/^\/notes\/([^/]+)$/);

  if (detailMatch) {
    const noteId = decodePathSegment(detailMatch[1]);

    const publications = Array.isArray(
      SITE_DATA?.publications,
    )
      ? SITE_DATA.publications
      : [];

    const publication = publications.find(
      (item) => String(item?.id) === noteId,
    );

    if (publication) {
      return {
        view: 'detail',
        publication,
        canonicalPath: `/notes/${encodeURIComponent(
          publication.id,
        )}`,
      };
    }
  }

  return {
    view: 'notes',
    publication: null,
    canonicalPath: '/notes',
  };
}

// ============================================================
// App
// ============================================================

export default function App() {
  // ----------------------------------------------------------
  // Initialize application state from the current URL
  // ----------------------------------------------------------

  const [routeState, setRouteState] = useState(() => {
    const pathname =
      typeof window !== 'undefined'
        ? window.location.pathname
        : '/';

    return resolveRoute(pathname);
  });

  const currentView = routeState.view;
  const selectedNote = routeState.publication;

  // Global search modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dark mode preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = window.localStorage.getItem('theme');

      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
    } catch {
      // Fall back to the current document theme.
    }

    return (
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
    );
  });

  // ----------------------------------------------------------
  // Keep noncanonical paths consistent with the resolved route
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      window.location.pathname !== routeState.canonicalPath
    ) {
      window.history.replaceState(
        null,
        '',
        routeState.canonicalPath,
      );
    }
  }, [routeState.canonicalPath]);

  // ----------------------------------------------------------
  // Theme management
  // ----------------------------------------------------------

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', isDarkMode);

    try {
      window.localStorage.setItem(
        'theme',
        isDarkMode ? 'dark' : 'light',
      );
    } catch {
      // Theme switching still works if storage is unavailable.
    }
  }, [isDarkMode]);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((previous) => !previous);
  }, []);

  // ----------------------------------------------------------
  // Native browser history
  // ----------------------------------------------------------

  /**
   * Push a new history entry only when the pathname changes.
   * replaceState is reserved for normalizing an invalid/noncanonical URL.
   */
  const pushUrl = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  /**
   * Support the browser Back and Forward buttons.
   *
   * popstate changes application state without pushing another
   * history entry, preventing navigation loops.
   */
  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = resolveRoute(
        window.location.pathname,
      );

      if (
        window.location.pathname !== nextRoute.canonicalPath
      ) {
        window.history.replaceState(
          null,
          '',
          nextRoute.canonicalPath,
        );
      }

      setRouteState(nextRoute);
      setIsSearchOpen(false);

      window.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
    };
  }, []);

  // ----------------------------------------------------------
  // Search modal and global keyboard shortcuts
  // ----------------------------------------------------------

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isSearchShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k';

      if (isSearchShortcut) {
        event.preventDefault();

        setIsSearchOpen((previous) => !previous);
        return;
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ----------------------------------------------------------
  // Unified navigation handler
  // ----------------------------------------------------------

  /**
   * Supports:
   *   handleNavigate('about')
   *   handleNavigate('notes')
   *   handleNavigate('blogs')
   *   handleNavigate('detail', 'st1')
   *   handleNavigate('detail', publicationObject)
   */
  const handleNavigate = useCallback(
    (view, noteIdOrObject) => {
      let nextRoute;
      let nextPath;

      if (view === 'detail') {
        const publications = Array.isArray(
          SITE_DATA?.publications,
        )
          ? SITE_DATA.publications
          : [];

        const publication =
          noteIdOrObject &&
          typeof noteIdOrObject === 'object'
            ? noteIdOrObject
            : publications.find(
                (item) =>
                  String(item?.id) ===
                  String(noteIdOrObject),
              );

        if (!publication?.id) {
          return;
        }

        nextPath = `/notes/${encodeURIComponent(
          publication.id,
        )}`;

        nextRoute = {
          view: 'detail',
          publication,
          canonicalPath: nextPath,
        };
      } else {
        nextPath = VIEW_PATHS[view];

        if (!nextPath) {
          return;
        }

        nextRoute = {
          view,
          publication: null,
          canonicalPath: nextPath,
        };
      }

      // Update the address bar and React state together.
      pushUrl(nextPath);
      setRouteState(nextRoute);

      // A navigation action always closes the search modal.
      setIsSearchOpen(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    [pushUrl],
  );

  // ----------------------------------------------------------
  // Select a publication
  // ----------------------------------------------------------

  // Shared by ArchivePage and SearchModal.
  const handleSelectNote = useCallback(
    (publication) => {
      if (!publication) return;

      handleNavigate('detail', publication);
    },
    [handleNavigate],
  );

  // Return from the note detail page to the archive.
  const handleBackToArchive = useCallback(() => {
    handleNavigate('notes');
  }, [handleNavigate]);

  // ----------------------------------------------------------
  // Application layout
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-neutral-100">

      {/* Global header */}
      <Header
        currentView={currentView}
        isDarkMode={isDarkMode}
        onNavigate={handleNavigate}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={openSearch}
      />

      {/* Main content */}
      <main>
        {currentView === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'notes' && (
          <ArchivePage
            onSelectNote={handleSelectNote}
          />
        )}

        {currentView === 'detail' && selectedNote && (
          <NoteDetailPage
            key={selectedNote.id || selectedNote.title}
            publication={selectedNote}
            onBack={handleBackToArchive}
          />
        )}

        {currentView === 'blogs' && (
          <section className="mx-auto w-full max-w-[1180px] px-6 py-16 sm:px-8 lg:px-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
              Personal Writing
            </p>

            <h1 className="font-serif text-3xl tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Blogs
            </h1>

            <p className="mt-4 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
              Articles and essays are currently being prepared.
            </p>
          </section>
        )}
      </main>

      {/* Global search modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelectNote={handleSelectNote}
        onNavigate={handleNavigate}
      />
    </div>
  );
}