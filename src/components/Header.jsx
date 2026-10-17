import { Search, Moon, Sun } from 'lucide-react';
import { UI } from '../data/siteData';

export default function Header({
  currentView,
  isDarkMode,
  onNavigate,
  onToggleTheme,
  onOpenSearch,
}) {
  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'notes', label: 'Notes' },
    { id: 'blogs', label: 'Blogs' },
  ];

  const focusRing =
    UI?.focusRing ??
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-[#0a0a0a]/80">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Left: Logo and navigation */}
        <div className="flex h-full min-w-0 items-center gap-5 sm:gap-8 md:gap-10">
          <button
            type="button"
            onClick={() => onNavigate?.('about')}
            className={`shrink-0 font-serif text-lg font-bold tracking-tight text-neutral-900 dark:text-white ${focusRing}`}
          >
            Saydric Zheng.
          </button>

          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-5 md:flex lg:gap-6"
          >
            {navItems.map((item) => {
              const isActive =
                currentView === item.id ||
                (currentView === 'detail' && item.id === 'notes');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    relative flex h-full shrink-0 items-center px-1
                    text-sm transition-colors duration-200
                    ${
                      isActive
                        ? 'font-semibold text-neutral-950 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                    }
                    ${focusRing}
                  `}
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

        {/* Right: Search and theme toggle */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            aria-label="Search archive"
            className={`
              group inline-flex items-center gap-2 rounded-lg
              border border-neutral-200/80 bg-neutral-100/80
              px-2.5 py-2 text-xs text-neutral-500
              shadow-sm transition-colors
              hover:bg-neutral-100 hover:text-neutral-800
              sm:gap-2.5 sm:px-3
              dark:border-neutral-700/70 dark:bg-neutral-800/80
              dark:hover:bg-neutral-800 dark:hover:text-neutral-200
              ${focusRing}
            `}
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
            className={`rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white ${focusRing}`}
            aria-label={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
            title={
              isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}