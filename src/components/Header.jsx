import { useEffect, useState } from 'react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { UI } from '../data/siteData';

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'notes', label: 'Notes' },
  { id: 'blogs', label: 'Blogs' },
];

export default function Header({
  currentView,
  isDarkMode,
  onNavigate,
  onToggleTheme,
  onOpenSearch,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 笔记详情页仍然高亮 Notes。
  const activeView =
    currentView === 'detail' || currentView === 'note-detail'
      ? 'notes'
      : currentView;

  const navigate = (view) => {
    onNavigate?.(view);
    setMobileMenuOpen(false);
  };

  // 支持 macOS 的 Command + K 和 Windows 的 Ctrl + K。
  useEffect(() => {
    if (typeof onOpenSearch !== 'function') return undefined;

    const handleSearchShortcut = (event) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k';

      if (!isShortcut) return;

      event.preventDefault();
      onOpenSearch();
    };

    window.addEventListener('keydown', handleSearchShortcut);

    return () => {
      window.removeEventListener('keydown', handleSearchShortcut);
    };
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-[#0a0a0a]/80">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">

        {/* Logo and desktop navigation */}
        <div className="flex h-full min-w-0 items-center gap-5 sm:gap-8 lg:gap-10">
          <button
            type="button"
            onClick={() => navigate('about')}
            aria-label="Go to About page"
            className={`shrink-0 whitespace-nowrap rounded-sm font-serif text-lg font-bold tracking-tight text-neutral-900 dark:text-white ${FOCUS_RING}`}
          >
            Saydric Zheng.
          </button>

          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-4 md:flex lg:gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex h-full shrink-0 items-center whitespace-nowrap px-1 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'font-semibold text-neutral-950 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                  } ${FOCUS_RING}`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-neutral-950 dark:bg-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search, theme toggle, and mobile menu */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            aria-label="Search archive"
            title="Search archive (⌘K / Ctrl+K)"
            className={`group inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200/80 bg-neutral-100/80 px-2.5 text-xs text-neutral-500 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-800 sm:gap-2.5 sm:px-3 dark:border-neutral-700/70 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${FOCUS_RING}`}
          >
            <Search
              className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Search archive...
            </span>

            <kbd className="hidden items-center gap-0.5 rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-400 sm:inline-flex dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
              <span className="text-[11px] leading-none">⌘</span>K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => onToggleTheme?.()}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white ${FOCUS_RING}`}
            aria-label={
              isDarkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              isDarkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={
              mobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden ${FOCUS_RING}`}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200/80 bg-white/95 dark:border-neutral-800 dark:bg-[#0a0a0a]/95 md:hidden">
          <nav
            id="mobile-primary-navigation"
            aria-label="Mobile navigation"
            className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 px-5 py-2 sm:px-8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`border-b py-3 text-left text-sm transition-colors ${FOCUS_RING} ${
                    isActive
                      ? 'border-neutral-950 font-semibold text-neutral-950 dark:border-white dark:text-white'
                      : 'border-neutral-200 text-neutral-500 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}