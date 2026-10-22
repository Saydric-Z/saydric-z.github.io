import { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'notes', label: 'Notes' },
  { id: 'blogs', label: 'Blogs' },
];

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf9]';

export default function Header({ currentView, onNavigate, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeView =
    currentView === 'detail' || currentView === 'note-detail'
      ? 'notes'
      : currentView;

  const navigate = (view) => {
    onNavigate?.(view);
    setMobileMenuOpen(false);
  };

  // Command+K on macOS; Ctrl+K on Windows and Linux.
  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return;
      }

      event.preventDefault();
      onOpenSearch?.();
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/70 bg-[#fafaf9]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-6 sm:px-8 lg:px-12">
        <div className="flex h-full min-w-0 items-center gap-5 sm:gap-7 lg:gap-10">
          <button
            type="button"
            onClick={() => navigate('about')}
            aria-label="Go to About page"
            className={`shrink-0 whitespace-nowrap rounded-sm ${FOCUS_RING}`}
          >
            <span className="font-serif text-xl font-bold tracking-tight text-neutral-900">
              Saydric Zheng.
            </span>
          </button>

          <nav aria-label="Main navigation" className="hidden h-full items-center gap-3 md:flex lg:gap-5">
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
                      ? 'font-medium text-neutral-950'
                      : 'text-neutral-500 hover:text-neutral-950'
                  } ${FOCUS_RING}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#1e3a5f]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => onOpenSearch?.()}
            aria-label="Search archive"
            aria-haspopup="dialog"
            title="Search archive (⌘K / Ctrl+K)"
            className={`group inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200/80 bg-white/45 px-2.5 text-xs text-neutral-500 transition-colors hover:bg-white/70 hover:text-neutral-800 sm:gap-2.5 sm:px-3 ${FOCUS_RING}`}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600" aria-hidden="true" />
            <span className="hidden sm:inline">Search archive...</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-neutral-200/80 bg-white/35 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-400 sm:inline-flex">
              <span className="text-[11px] leading-none">⌘</span>K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100/70 hover:text-neutral-950 md:hidden ${FOCUS_RING}`}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-neutral-200/60 bg-[#fafaf9]/75 backdrop-blur-md md:hidden">
          <nav
            id="mobile-primary-navigation"
            aria-label="Mobile navigation"
            className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 px-6 py-2 sm:px-8 lg:px-12"
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
                      ? 'border-[#1e3a5f] font-medium text-neutral-950'
                      : 'border-neutral-200/80 text-neutral-500 hover:text-neutral-950'
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
