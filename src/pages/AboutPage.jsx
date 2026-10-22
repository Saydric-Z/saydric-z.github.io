import { useState, useCallback } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Globe,
  Mail,
  FileText,
} from 'lucide-react';

import { SITE_DATA, UI } from '../data/siteData';

// Brand marks are defined inline so this file does not depend on brand exports
// from lucide-react. Both icons inherit their color from the current text color.
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

function Linkedin({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.96 20.452H3.71V9h3.25v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

export default function AboutPage({ onNavigate }) {
  const [copiedId, setCopiedId] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // ------------------------------------------------------------
  // Safe data access
  // ------------------------------------------------------------

  const profile = SITE_DATA?.profile;

  const researchAreas = Array.isArray(profile?.researchAreas)
    ? profile.researchAreas
    : [];

  const contacts = Array.isArray(profile?.contacts)
    ? profile.contacts
    : [];

  const bio = Array.isArray(profile?.bio)
    ? profile.bio
    : [];

  // 互换顺序：Computer Science 放在 Statistics 前面
  const domain =
    profile?.domain ??
    'COMPUTER SCIENCE & STATISTICS';

  const edition = profile?.edition ?? '2026';

  // Optional profile links are read from siteData when available.
  const findContact = (...terms) =>
    contacts.find((contact) =>
      terms.some((term) =>
        String(contact?.label ?? contact?.id ?? '')
          .toLowerCase()
          .includes(term)
      )
    );

  const githubContact = findContact('github');
  const linkedinContact = findContact('linkedin');
  const emailContact = findContact('email', 'e-mail');
  const cvContact = findContact('cv', 'resume', 'résumé');

  const resolveLink = (contact, fallback = '') => {
    const raw = contact?.url ?? contact?.href ?? contact?.value ?? fallback;
    if (!raw) return '';
    const value = String(raw).trim();
    if (/^(https?:|mailto:|tel:|\/)/i.test(value)) return value;
    if (value.includes('@')) return `mailto:${value}`;
    return fallback;
  };

  const quickLinks = [
    {
      label: 'GitHub',
      href: resolveLink(githubContact, 'https://github.com/saydric-z'),
      Icon: Github,
    },
    {
      label: 'LinkedIn',
      href: resolveLink(linkedinContact, profile?.linkedinUrl ?? profile?.linkedin ?? ''),
      Icon: Linkedin,
    },
    {
      label: 'Email',
      href: resolveLink(emailContact),
      Icon: Mail,
    },
    {
      label: 'CV',
      href: resolveLink(cvContact, profile?.cvUrl ?? profile?.cv ?? '/cv.pdf'),
      Icon: FileText,
    },
  ].filter((link) => Boolean(link.href));

  const researchTags = [
    'Statistical Inference',
    'Stochastic Calculus',
    'Statistical Learning',
    'Machine Learning'
  ];

  // ------------------------------------------------------------
  // Clipboard
  // ------------------------------------------------------------

  const handleCopy = useCallback(async (id, value) => {
    try {
      await navigator.clipboard.writeText(String(value ?? ''));

      setCopiedId(id);

      window.setTimeout(() => {
        setCopiedId((currentId) =>
          currentId === id ? null : currentId
        );
      }, 2000);
    } catch (error) {
      console.warn('Clipboard failed:', error);
    }
  }, []);

  // ------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------

  const navigateToNotes = () => {
    onNavigate?.('notes');
  };

  // ------------------------------------------------------------
  // Page
  // ------------------------------------------------------------

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-[1180px]
        px-6
        py-12
        sm:px-8
        sm:py-16
        lg:px-12
        lg:py-20
      "
    >
      <div className="space-y-16 md:space-y-20">

        {/* ======================================================
            INTRODUCTION
        ====================================================== */}

        <section className="w-full">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            
            {/* Personal profile column */}
            <aside className="mx-auto w-full max-w-[320px] md:col-span-4 md:mx-0 md:max-w-none">
              {/* Editorial portrait */}
              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-neutral-200/80
                  bg-neutral-50
                  shadow-sm
                  dark:border-neutral-800
                  dark:bg-neutral-900
                "
              >
                <div className="aspect-[4/5] overflow-hidden">
                  {avatarFailed ? (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        font-serif
                        text-5xl
                        tracking-tight
                        text-neutral-400
                        dark:text-neutral-600
                      "
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
                      className="
                        h-full
                        w-full
                        object-cover
                        object-[center_18%]
                      "
                      loading="eager"
                      decoding="async"
                    />
                  )}
                </div>
              </div>

              {/* 肖像下方的个人信息卡片 */}
              <div className="mt-5 space-y-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Saydric Zheng
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    CS &amp; Statistics · UWaterloo
                  </p>
                </div>

                {/* 研究领域标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {researchTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 快捷链接 */}
                {quickLinks.length > 0 && (
                  <div className="flex items-center gap-4 border-t border-neutral-200/60 pt-4 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                    {quickLinks.map(({ label, href, Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Biography and existing page actions */}
            <div className="min-w-0 md:col-span-8">
              {/* Academic field / domain */}
              <p className="mb-5 font-mono text-xs uppercase tracking-widest text-neutral-400">
                {domain}
              </p>

              {/* Main heading */}
              <h1
                className="mb-7 font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-neutral-50"
              >
                Hello, I am{' '}
                <span className="font-semibold">Saydric Zheng.</span>
              </h1>

              {/* Preserve every biography paragraph from siteData */}
              {bio.length > 0 && (
                <div className="w-full space-y-5 font-serif text-base leading-[1.85] text-neutral-600 md:text-[17px] dark:text-neutral-400">
                  {bio.map((paragraph, index) => (
                    <p
                      key={`bio-${index}`}
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>
              )}

              {/* Edition and navigation */}
              <div className="mt-10 flex flex-col gap-4 border-y border-neutral-200 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-neutral-400 sm:text-xs">
                  <span>
                    FOCUS: ANALYSIS &amp; KERNELS{' · '}{edition}
                  </span>
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </div>

                <button
                  type="button"
                  onClick={navigateToNotes}
                  className={`group inline-flex w-fit items-center gap-2 text-sm font-medium text-neutral-900 underline underline-offset-4 transition-colors duration-200 hover:text-neutral-500 dark:text-neutral-100 dark:hover:text-neutral-300 ${FOCUS_RING}`}
                >
                  <span>Explore Academic Notes</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            RESEARCH DIRECTIONS
        ====================================================== */}

        {researchAreas.length > 0 && (
          <section className="w-full">
            <div
              className="
                mb-6
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-baseline
                sm:justify-between
              "
            >
              <h2
                className="
                  font-mono
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-400
                "
              >
                Research Directions
              </h2>

              <span className="font-mono text-xs text-neutral-400">
                {String(researchAreas.length).padStart(2, '0')}
                {' PILLARS'}
              </span>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800">
              {researchAreas.map((area, index) => (
                <button
                  key={area?.id ?? area?.title ?? index}
                  type="button"
                  onClick={navigateToNotes}
                  className={`
                    group
                    grid
                    w-full
                    grid-cols-1
                    items-start
                    gap-4
                    border-b
                    border-neutral-200
                    py-6
                    text-left
                    transition-colors
                    duration-200
                    hover:bg-neutral-50/80
                    sm:py-7
                    md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.7fr)_24px]
                    md:items-center
                    md:gap-6
                    lg:gap-8
                    dark:border-neutral-800
                    dark:hover:bg-white/[0.025]
                    ${FOCUS_RING}
                  `}
                >
                  {/* Left: index and research title */}
                  <div
                    className="
                      grid
                      min-w-0
                      grid-cols-[32px_minmax(0,1fr)]
                      items-start
                      gap-3
                    "
                  >
                    <span
                      className="
                        mt-1
                        font-mono
                        text-xs
                        tabular-nums
                        text-neutral-400
                      "
                    >
                      {area?.index ??
                        String(index + 1).padStart(2, '0')}
                    </span>

                    <h3
                      className="
                        min-w-0
                        font-serif
                        text-lg
                        font-semibold
                        leading-snug
                        text-neutral-900
                        transition-colors
                        duration-200
                        group-hover:text-neutral-600
                        sm:text-xl
                        dark:text-neutral-100
                        dark:group-hover:text-neutral-300
                      "
                    >
                      {area?.title ?? 'Untitled Research Area'}
                    </h3>
                  </div>

                  {/* Right: description */}
                  <p
                    className="
                      min-w-0
                      text-sm
                      leading-relaxed
                      text-neutral-600
                      md:text-base
                      dark:text-neutral-400
                    "
                  >
                    {area?.description ?? ''}
                  </p>

                  {/* Arrow */}
                  <div
                    className="
                      hidden
                      justify-self-end
                      text-neutral-400
                      transition-colors
                      duration-200
                      group-hover:text-neutral-900
                      md:flex
                      dark:group-hover:text-neutral-100
                    "
                  >
                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                      aria-hidden="true"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            CONTACTS
        ====================================================== */}

        {contacts.length > 0 && (
          <section className="w-full pb-8">
            <div className="mb-6">
              <h2
                className="
                  font-mono
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-400
                "
              >
                Direct Inquiries &amp; Coordinates
              </h2>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800">
              {contacts.map((contact, index) => {
                const Icon = contact?.icon ?? Globe;
                const isCopied = copiedId === contact?.id;

                return (
                  <button
                    key={contact?.id ?? index}
                    type="button"
                    onClick={() =>
                      handleCopy(
                        contact?.id ?? index,
                        contact?.value ?? ''
                      )
                    }
                    aria-label={
                      isCopied
                        ? `Copied ${contact?.label ?? 'contact'}`
                        : `Copy ${contact?.label ?? 'contact'}`
                    }
                    className={`
                      group
                      grid
                      w-full
                      grid-cols-1
                      items-start
                      gap-3
                      border-b
                      border-neutral-200
                      py-5
                      text-left
                      transition-colors
                      duration-200
                      hover:bg-neutral-50/80
                      sm:py-6
                      md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto]
                      md:items-center
                      md:gap-6
                      dark:border-neutral-800
                      dark:hover:bg-white/[0.025]
                      ${FOCUS_RING}
                    `}
                  >
                    {/* Contact label */}
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon
                        className="h-4 w-4 shrink-0 text-neutral-400"
                        aria-hidden="true"
                      />

                      <span
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-neutral-500
                          dark:text-neutral-400
                        "
                      >
                        {contact?.label ?? 'Contact'}
                      </span>
                    </div>

                    {/* Contact value */}
                    <span
                      className="
                        min-w-0
                        break-words
                        font-serif
                        text-base
                        text-neutral-900
                        sm:text-lg
                        dark:text-neutral-100
                      "
                    >
                      {contact?.value ?? ''}
                    </span>

                    {/* Copy status */}
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        font-mono
                        text-[11px]
                        tracking-wider
                        text-neutral-400
                        transition-colors
                        duration-200
                        group-hover:text-neutral-900
                        md:justify-self-end
                        dark:group-hover:text-neutral-100
                      "
                    >
                      {isCopied ? (
                        <>
                          <Check
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>COPY</span>
                        </>
                      )}
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