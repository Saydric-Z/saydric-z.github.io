// src/App.jsx

import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ArchivePage from './pages/ArchivePage';
import NoteDetailPage from './pages/NoteDetailPage';

import { SITE_DATA } from './data/siteData';

// ============================================================
// Native URL routing helpers
// ============================================================

const VIEW_PATHS = {
  about: '/about',
  projects: '/projects',
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
 *   /projects     -> Projects
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

  if (path === '/projects') {
    return {
      view: 'projects',
      publication: null,
      canonicalPath: '/projects',
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

    const publications = Array.isArray(SITE_DATA?.publications)
      ? SITE_DATA.publications
      : [];

    const publication = publications.find(
      (item) => String(item?.id) === noteId,
    );

    if (publication) {
      return {
        view: 'detail',
        publication,
        canonicalPath: `/notes/${encodeURIComponent(publication.id)}`,
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
  // Initialize application state from the current URL.
  const [routeState, setRouteState] = useState(() => {
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';

    return resolveRoute(pathname);
  });

  const currentView = routeState.view;
  const selectedNote = routeState.publication;

  // Global search modal.
  const [isSearchOpen, setIsSearchOpen] = useState(false);


  // Keep noncanonical paths consistent with the resolved route.
  useEffect(() => {
    if (window.location.pathname !== routeState.canonicalPath) {
      window.history.replaceState(null, '', routeState.canonicalPath);
    }
  }, [routeState.canonicalPath]);

  // Enforce the site's permanent light theme and clear any legacy class.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';

    try {
      window.localStorage.removeItem('theme');
    } catch {
      // The light-only layout does not depend on localStorage.
    }
  }, []);

  // ----------------------------------------------------------
  // Native browser history
  // ----------------------------------------------------------

  const pushUrl = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  // Support browser Back and Forward buttons without creating new entries.
  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = resolveRoute(window.location.pathname);

      if (window.location.pathname !== nextRoute.canonicalPath) {
        window.history.replaceState(null, '', nextRoute.canonicalPath);
      }

      setRouteState(nextRoute);
      setIsSearchOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ----------------------------------------------------------
  // Search modal
  // ----------------------------------------------------------

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // Header owns the Cmd/Ctrl+K shortcut. This app-level listener only
  // provides a global Escape fallback, avoiding duplicate shortcut handlers
  // that could open and immediately close the search modal.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // ----------------------------------------------------------
  // Unified navigation handler
  // ----------------------------------------------------------

  /**
   * Supports:
   *   handleNavigate('about')
   *   handleNavigate('projects')
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
        const publications = Array.isArray(SITE_DATA?.publications)
          ? SITE_DATA.publications
          : [];

        const publication =
          noteIdOrObject && typeof noteIdOrObject === 'object'
            ? noteIdOrObject
            : publications.find(
                (item) => String(item?.id) === String(noteIdOrObject),
              );

        if (!publication?.id) return;

        nextPath = `/notes/${encodeURIComponent(publication.id)}`;
        nextRoute = {
          view: 'detail',
          publication,
          canonicalPath: nextPath,
        };
      } else {
        nextPath = VIEW_PATHS[view];
        if (!nextPath) return;

        nextRoute = {
          view,
          publication: null,
          canonicalPath: nextPath,
        };
      }

      // Update address bar and React state together.
      pushUrl(nextPath);
      setRouteState(nextRoute);
      setIsSearchOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pushUrl],
  );

  // Shared by the Notes archive and SearchModal.
  const handleSelectNote = useCallback(
    (publication) => {
      if (!publication) return;
      handleNavigate('detail', publication);
    },
    [handleNavigate],
  );

  const handleBackToArchive = useCallback(() => {
    handleNavigate('notes');
  }, [handleNavigate]);

  // ============================================================
  // Application layout
  // ============================================================

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9] text-neutral-900">
      {/* Global header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={openSearch}
      />

      {/* Main content. Each page component owns its own main landmark. */}
      <div className="flex-1">
        {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentView === 'projects' && <ProjectsPage />}

        {currentView === 'notes' && (
          <ArchivePage onSelectNote={handleSelectNote} />
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

            <h1 className="font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
              Blogs
            </h1>

            <p className="mt-4 text-sm leading-7 text-neutral-500">
              Articles and essays are currently being prepared.
            </p>
          </section>
        )}
      </div>

      {/* One shared footer for every top-level page and note detail. */}
      <Footer />

      {/* Mount only while open so search state resets on each opening. */}
      {isSearchOpen && (
        <SearchModal
          isOpen={true}
          onClose={closeSearch}
          onSelectNote={handleSelectNote}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
