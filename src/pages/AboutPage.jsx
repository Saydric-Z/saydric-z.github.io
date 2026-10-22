import { useCallback, useState } from 'react';
import { SITE_DATA } from '../data/siteData';

// Inline GitHub brand mark avoids relying on a brand icon export.
function Github({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .297a12 12 0 0 0-3.797 23.4c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 6.01 0c2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.805 5.624-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297Z"
      />
    </svg>
  );
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf9]';

export default function AboutPage({ onNavigate }) {
  const [copiedId, setCopiedId] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const profile = SITE_DATA?.profile ?? {};

  const researchAreas = Array.isArray(profile.researchAreas)
    ? profile.researchAreas
    : [];

  const contacts = Array.isArray(profile.contacts)
    ? profile.contacts
    : [];

  const bio = Array.isArray(profile.bio) ? profile.bio : [];
  const domain = profile.domain ?? 'COMPUTER SCIENCE & STATISTICS';
  const edition = profile.edition ?? '2026';

  // Match contact records by label or id, case-insensitively.
  const findContact = (...terms) =>
    contacts.find((contact) =>
      terms.some((term) =>
        String(contact?.label ?? contact?.id ?? '')
          .toLowerCase()
          .includes(term),
      ),
    );

  const githubContact = findContact('github');
  const linkedinContact = findContact('linkedin');
  const emailContact = findContact('email', 'e-mail');
  const cvContact = findContact('cv', 'resume', 'résumé');

  const resolveLink = (contact, fallback = '') => {
    const raw = contact?.url ?? contact?.href ?? contact?.value ?? fallback;
    if (!raw) return '';

    const value = String(raw).trim();
    if (!value) return '';

    if (/^(https?:|mailto:|tel:|\/)/i.test(value)) return value;
    if (value.includes('@')) return `mailto:${value}`;

    if (/^(www\.)?(github\.com|linkedin\.com)\//i.test(value)) {
      return `https://${value}`;
    }

    return '';
  };

  const quickLinks = [
    {
      label: 'GitHub',
      href: resolveLink(githubContact, 'https://github.com/saydric-z'),
      isGitHub: true,
    },
    {
      label: 'LinkedIn',
      href: resolveLink(
        linkedinContact,
        profile.linkedinUrl ?? profile.linkedin ?? '',
      ),
    },
    { label: 'Email', href: resolveLink(emailContact) },
    {
      label: 'CV',
      href: resolveLink(cvContact, profile.cvUrl ?? profile.cv ?? ''),
    },
  ].filter((link) => Boolean(link.href));

  const researchTags = [
    'Statistical Inference',
    'Stochastic Calculus',
    'Statistical Learning',
    'Machine Learning',
  ];

  const handleCopy = useCallback(async (id, value) => {
    try {
      await navigator.clipboard.writeText(String(value ?? ''));
      setCopiedId(id);

      window.setTimeout(() => {
        setCopiedId((currentId) => (currentId === id ? null : currentId));
      }, 1800);
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="space-y-16 md:space-y-20">
        {/* Introduction */}
        <section className="w-full">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* Profile column */}
            <aside className="mx-auto w-full max-w-[320px] md:col-span-4 md:mx-0 md:max-w-none">
              <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white/60">
                <div className="aspect-[4/5] overflow-hidden">
                  {avatarFailed ? (
                    <div
                      className="flex h-full w-full items-center justify-center font-serif text-5xl tracking-tight text-neutral-400"
                      role="img"
                      aria-label="Portrait placeholder for Saydric Zheng"
                    >
                      SZ
                    </div>
                  ) : (
                    <img
                      src="/avatar.jpg"
                      alt="Portrait of Saydric Zheng"
                      onError={() => setAvatarFailed(true)}
                      className="h-full w-full object-cover object-[center_18%]"
                      loading="eager"
                      decoding="async"
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold tracking-tight text-neutral-900">
                    Saydric Zheng.
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    CS &amp; Statistics · UWaterloo
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {researchTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-neutral-300 bg-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-neutral-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {quickLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-200/80 pt-4 text-xs text-neutral-600">
                    {quickLinks.map(({ label, href, isGitHub }) => (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={`inline-flex items-center gap-1.5 transition-colors hover:text-[#1e3a5f] ${FOCUS_RING}`}
                      >
                        {isGitHub && (
                          <Github className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Biography column */}
            <div className="min-w-0 md:col-span-8">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">
                {domain}
              </p>

              <h1 className="mb-7 font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                Hello, I am{' '}
                <span className="font-semibold">Saydric Zheng.</span>
              </h1>

              {bio.length > 0 && (
                <div className="about-bio w-full max-w-[68ch] space-y-5 font-serif text-base leading-[1.8] text-neutral-700 md:text-[17px] [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-[#1e3a5f]">
                  {bio.map((paragraph, index) => (
                    <p
                      key={`bio-${index}`}
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>
              )}

              <div className="mt-10 flex flex-col gap-4 border-y border-neutral-200 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 sm:text-xs">
                  <span>
                    FOCUS: ANALYSIS &amp; KERNELS{' · '}{edition}
                  </span>
                </div>

                {/* Directly call the App navigation handler. */}
                <button
                  type="button"
                  onClick={() => onNavigate?.('notes')}
                  className={`group inline-flex w-fit cursor-pointer items-center gap-1.5 font-serif text-sm font-medium text-neutral-900 no-underline transition-colors duration-200 hover:text-[#1e3a5f] hover:underline hover:underline-offset-4 ${FOCUS_RING}`}
                >
                  <span>Explore Academic Notes</span>
                  <span className="font-mono transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Research directions */}
        {researchAreas.length > 0 && (
          <section className="w-full">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">
                Research Directions
              </h2>
              <span className="font-mono text-xs text-neutral-500">
                {String(researchAreas.length).padStart(2, '0')} PILLARS
              </span>
            </div>

            <div className="border-t border-neutral-200">
              {researchAreas.map((area, index) => (
                <button
                  key={area?.id ?? area?.title ?? index}
                  type="button"
                  onClick={() => onNavigate?.('notes')}
                  className={`group grid w-full cursor-pointer grid-cols-1 items-start gap-4 border-b border-neutral-200 py-6 text-left transition-colors duration-200 hover:bg-neutral-50/80 sm:py-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.7fr)_24px] md:items-center md:gap-6 lg:gap-8 ${FOCUS_RING}`}
                >
                  <div className="grid min-w-0 grid-cols-[32px_minmax(0,1fr)] items-start gap-3">
                    <span className="mt-1 font-mono text-xs tabular-nums text-neutral-500">
                      {area?.index ?? String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="min-w-0 font-serif text-lg font-semibold leading-snug text-neutral-900 transition-colors duration-200 group-hover:text-[#1e3a5f] sm:text-xl">
                      {area?.title ?? 'Untitled Research Area'}
                    </h3>
                  </div>

                  <p className="min-w-0 text-sm leading-relaxed text-neutral-700 md:text-base">
                    {area?.description ?? ''}
                  </p>

                  <span
                    aria-hidden="true"
                    className="hidden justify-self-end font-mono text-neutral-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#1e3a5f] md:block"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Contacts */}
        {contacts.length > 0 && (
          <section className="w-full pb-8">
            <div className="mb-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">
                Direct Inquiries &amp; Coordinates
              </h2>
            </div>

            <div className="border-t border-neutral-200">
              {contacts.map((contact, index) => {
                const contactId = contact?.id ?? index;
                const isCopied = copiedId === contactId;

                return (
                  <button
                    key={contact?.id ?? index}
                    type="button"
                    onClick={() => handleCopy(contactId, contact?.value ?? '')}
                    aria-label={
                      isCopied
                        ? `Copied ${contact?.label ?? 'contact'}`
                        : `Copy ${contact?.label ?? 'contact'}`
                    }
                    className={`group grid w-full cursor-pointer grid-cols-1 items-start gap-3 border-b border-neutral-200 py-5 text-left transition-colors duration-200 hover:bg-neutral-50/80 sm:py-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] md:items-center md:gap-6 ${FOCUS_RING}`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs uppercase tracking-widest text-neutral-500">
                        {contact?.label ?? 'Contact'}
                      </span>
                    </div>

                    <span className="min-w-0 break-words font-serif text-base text-neutral-900 sm:text-lg">
                      {contact?.value ?? ''}
                    </span>

                    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900 md:justify-self-end">
                      {isCopied ? 'COPIED' : 'COPY'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
