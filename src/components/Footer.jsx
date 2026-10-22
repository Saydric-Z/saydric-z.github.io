import { SITE_DATA } from '../data/siteData';

function findContact(contacts, term) {
  return contacts.find((contact) =>
    String(contact?.label ?? contact?.id ?? '').toLowerCase().includes(term),
  );
}

function getContactValue(contact) {
  return contact?.url ?? contact?.href ?? contact?.value ?? '';
}

function normalizeGitHubUrl(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('@')) return `https://github.com/${value.slice(1)}`;
  if (/^[a-z0-9-]+$/i.test(value)) return `https://github.com/${value}`;
  return '';
}

export default function Footer({
  year = new Date().getFullYear(),
  name = 'Saydric Zheng',
  githubUrl,
  email,
}) {
  const contacts = Array.isArray(SITE_DATA?.profile?.contacts)
    ? SITE_DATA.profile.contacts
    : [];

  const githubContact = findContact(contacts, 'github');
  const emailContact = findContact(contacts, 'email');

  const resolvedGitHub =
    normalizeGitHubUrl(githubUrl) ||
    normalizeGitHubUrl(getContactValue(githubContact)) ||
    'https://github.com/saydric-z';

  const rawEmail = String(email ?? getContactValue(emailContact) ?? '').trim();
  const emailAddress = rawEmail.replace(/^mailto:/i, '');
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);

  const handleBackToTop = () => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const linkClass =
    'whitespace-nowrap transition-colors hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950 dark:hover:text-neutral-200';

  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-6 py-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="whitespace-nowrap">© {year} {name}</p>

        <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={resolvedGitHub} target="_blank" rel="noreferrer" className={linkClass}>
            GitHub
          </a>

          {hasEmail ? (
            <a href={`mailto:${emailAddress}`} className={linkClass}>
              Email
            </a>
          ) : (
            <span title="Configure a real email address in the Footer email prop or SITE_DATA.profile.contacts.">
              Email
            </span>
          )}

          <button type="button" onClick={handleBackToTop} className={linkClass}>
            Back to top ↑
          </button>
        </nav>
      </div>
    </footer>
  );
}
