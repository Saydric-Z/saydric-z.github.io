import { useState, useCallback } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Globe,
} from 'lucide-react';

import { SITE_DATA, UI } from '../data/siteData';

const FOCUS_RING =
  UI?.focusRing ??
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

export default function AboutPage({ onNavigate }) {
  const [copiedId, setCopiedId] = useState(null);

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
          {/* Academic field / domain */}
          <p className="mb-5 font-mono text-xs uppercase tracking-widest text-neutral-400">
            {domain}
          </p>

          {/* Main heading */}
          <h1
            className="
              mb-7
              font-serif
              text-3xl
              font-normal
              leading-tight
              tracking-tight
              text-neutral-900
              sm:text-4xl
              md:text-5xl
              dark:text-neutral-50
            "
          >
            Hello, I am{' '}
            <span className="font-semibold">
              Saydric Zheng.
            </span>
          </h1>

          {/* Biography */}
          {bio.length > 0 && (
            <div
              className="
                w-full
                space-y-4
                text-base
                leading-relaxed
                text-neutral-600
                md:text-lg
                dark:text-neutral-400
              "
            >
              {bio.map((paragraph, index) => (
                <p
                  key={`bio-${index}`}
                  dangerouslySetInnerHTML={{
                    __html: paragraph,
                  }}
                />
              ))}
            </div>
          )}

          {/* Edition and navigation */}
          <div
            className="
              mt-10
              flex
              flex-col
              gap-4
              border-y
              border-neutral-200
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              dark:border-neutral-800
            "
          >
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-neutral-400 sm:text-xs">
              <span>
                FOCUS: ANALYSIS &amp; KERNELS
                {' · '}
                {edition}
              </span>

              <Sparkles
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={navigateToNotes}
              className={`
                group
                inline-flex
                w-fit
                items-center
                gap-2
                text-sm
                font-medium
                text-neutral-900
                underline
                underline-offset-4
                transition-colors
                duration-200
                hover:text-neutral-500
                dark:text-neutral-100
                dark:hover:text-neutral-300
                ${FOCUS_RING}
              `}
            >
              <span>Explore Academic Notes</span>

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
            </button>
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